import { VendorPhotoModel } from '../entities/vendor-photo.model';

export interface IVendorPhotoRepository {
  create(vendorId: number, imageUrl: string, publicId: string, type?: string): Promise<VendorPhotoModel>;
  findByVendor(vendorId: number): Promise<VendorPhotoModel[]>;
  findById(id: string): Promise<VendorPhotoModel | null>;
  delete(id: string): Promise<void>;
  deleteByPublicId(publicId: string): Promise<void>;
  updateOrder(id: string, order: number): Promise<void>;
}
