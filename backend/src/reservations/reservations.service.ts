import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateReservationDto, ReservationItemDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { EquipmentRepository } from 'src/equipment/equipment.repository';
import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly equipmentRepo: EquipmentRepository,
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { 
        items: { include: { equipment: true } },
        payment: true,
      },
    });
  }

  async create(userId: string, dto: CreateReservationDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) throw new BadRequestException('endDate must be after startDate');

    for (const item of dto.items) {
      // this calls into the equipment module repository, not Reservation
      const equipment = await this.equipmentRepo.findById(item.equipmentId);
      if (!equipment) throw new NotFoundException(`Equipment ${item.equipmentId} not found`);
      if (!equipment.available) throw new BadRequestException(`${equipment.name} is currently unavailable`);

      const booked = await this.equipmentRepo.getBookedQuantity(item.equipmentId, startDate, endDate);
      const available = equipment.stockQuantity - booked;

      if (item.quantity > available) {
        throw new BadRequestException(
          `${equipment.name} only has ${available} unit(s) available for the selected dates`,
        );
      }
    }

    // Fetch prices and build items with numeric unitPrice for the repository
    const equipmentList = await this.prisma.equipment.findMany({
      where: { id: { in: dto.items.map(i => i.equipmentId) } },
    });

    const itemsWithPrice = dto.items.map((item) => {
      const eq = equipmentList.find(e => e.id === item.equipmentId)!;
      return {
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        unitPrice: Number(eq.rentalPrice), // convert Prisma.Decimal → number
      };
    });

    return this.reservationsRepository.createWithItems(userId, startDate, endDate, itemsWithPrice);
  }

  async updateStatus(id: string, newStatus: ReservationStatus, userRole?: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException();

    const validTransitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['RETURNED'],
    };

    // Validate BEFORE writing to DB
    if (!validTransitions[reservation.status]?.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${reservation.status} to ${newStatus}`);
    }

    const updated = await this.reservationsRepository.updateStatus(id, newStatus);

    if (newStatus === 'APPROVED') {
      await this.notificationsService.queueNotification(updated.userId, 'Your reservation has been approved!');
    } else if (newStatus === 'REJECTED') {
      await this.notificationsService.queueNotification(updated.userId, 'Your reservation was rejected.');
    } else if (newStatus === 'ACTIVE') {
      await this.notificationsService.queueNotification(updated.userId, 'Your equipment has been released! Enjoy your rental.');
    } else if (newStatus === 'RETURNED') {
      await this.notificationsService.queueNotification(updated.userId, 'Your equipment has been returned successfully. Thank you!');
    }

    return updated;
  }

  /** Operator releases equipment: APPROVED → ACTIVE */
  async releaseReservation(id: string) {
    return this.updateStatus(id, 'ACTIVE');
  }

  async returnItems(id: string, returns: { equipmentId: string; qtyGood: number; qtyDamaged: number; note?: string }[], userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!reservation) throw new NotFoundException();
    if (reservation.status !== 'ACTIVE') throw new BadRequestException('Reservation must be ACTIVE to return items');

    for (const ret of returns) {
      const item = reservation.items.find(i => i.equipmentId === ret.equipmentId);
      if (!item) continue;
      
      const availableToReturn = item.quantity - item.returnedQuantity - item.damagedQuantity;
      if (ret.qtyGood + ret.qtyDamaged > availableToReturn) {
        throw new BadRequestException(`Cannot return more than rented for equipment ${ret.equipmentId}`);
      }

      if (ret.qtyDamaged > 0) {
        await this.prisma.reservationItem.update({
          where: { id: item.id },
          data: { damagedQuantity: { increment: ret.qtyDamaged } }
        });
        await this.prisma.equipment.update({
          where: { id: ret.equipmentId },
          data: { stockQuantity: { decrement: ret.qtyDamaged } }
        });
        await this.prisma.activityLog.create({
          data: {
            userId,
            action: 'DAMAGE_RECORDED',
            details: { equipmentId: ret.equipmentId, note: ret.note, quantity: ret.qtyDamaged, reservationId: id } as any
          }
        });
      }

      if (ret.qtyGood > 0) {
        await this.prisma.reservationItem.update({
          where: { id: item.id },
          data: { returnedQuantity: { increment: ret.qtyGood } }
        });
      }
    }

    const updatedReservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!updatedReservation) throw new NotFoundException();

    const allReturned = updatedReservation.items.every(i => (i.returnedQuantity + i.damagedQuantity) === i.quantity);

    if (allReturned) {
      return this.updateStatus(id, 'RETURNED');
    }

    return updatedReservation;
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException();
    if (reservation.userId !== userId) throw new BadRequestException('You can only cancel your own reservations');
    
    return this.updateStatus(id, 'CANCELLED');
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { equipment: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.reservationsRepository.findById(id);
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  async remove(id: string) {
    await this.prisma.reservationItem.deleteMany({ where: { reservationId: id } });
    return this.prisma.reservation.delete({ where: { id } });
  }
}
