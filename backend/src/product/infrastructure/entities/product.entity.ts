import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  image_url: string | null;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ default: 0 })
  stock: number;

  @Column()
  vendor_id: number;

  @ManyToOne(() => VendorEntity)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorEntity;
}