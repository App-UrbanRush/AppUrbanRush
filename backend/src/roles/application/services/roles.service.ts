import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { IRolesRepository } from '../../domain/repositories/roles.repository.interface';
import { RolEntity } from '../../infrastructure/persistence/entity/rol.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @Inject('IRolesRepository')
    private readonly _rolRepository: IRolesRepository,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultRoles();
  }

  private async initializeDefaultRoles() {
    const defaultRoles = [
      { rol_id: 1, rol_name: 'Admin' },
      { rol_id: 2, rol_name: 'User' },
      { rol_id: 3, rol_name: 'Domiciliario' },
      { rol_id: 4, rol_name: 'Empresa' } // ID corregido a 4
    ];
    
    for (const roleData of defaultRoles) {
      const exists = await this._rolRepository.findById(roleData.rol_id);
      if (!exists) {
        await this._rolRepository.save(roleData);
      }
    }
  }

  async findAll(): Promise<RolEntity[]> {
    return this._rolRepository.findAll();
  }
}