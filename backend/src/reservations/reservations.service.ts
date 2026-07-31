import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto, ReservationItemDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { EquipmentRepository } from 'src/equipment/equipment.repository';
import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly equipmentRepo: EquipmentRepository,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async findByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { items: { include: { equipment: true } } },
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

    // Only after ALL items pass, hand off to the Reservation repository
    return this.createWithItems(userId, startDate, endDate, dto.items);
  }

    async createWithItems(userId: string, startDate: Date, endDate: Date, items: ReservationItemDto[]) {
    const equipmentList = await this.prisma.equipment.findMany({
      where: { id: { in: items.map(i => i.equipmentId) } },
    });

    return this.prisma.reservation.create({
      data: {
        userId,
        startDate,
        endDate,
        status: 'PENDING',
        items: {
          create: items.map((item) => {
            const eq = equipmentList.find(e => e.id === item.equipmentId);
            return { equipmentId: item.equipmentId, quantity: item.quantity, unitPrice: eq!.rentalPrice };
          }),
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, newStatus: ReservationStatus, userRole?: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException();

    const validTransitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['RETURNED'],
    };

    if (!validTransitions[reservation.status]?.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${reservation.status} to ${newStatus}`);
    }

    return this.prisma.reservation.update({ where: { id }, data: { status: newStatus } });
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException();
    if (reservation.userId !== userId) throw new BadRequestException('You can only cancel your own reservations');
    
    return this.updateStatus(id, 'CANCELLED');
  }

  findAll(id: string) {
    return `This action returns all reservations`;
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
