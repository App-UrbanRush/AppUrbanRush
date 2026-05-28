import type { IStoreRepository } from "../../domain/interfaces/IStoreRepository";
import type { HomeData } from "../../domain/types/store.types";

export class GetHomeDataUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(): Promise<HomeData> {
    const [heroBanner, categories, recommendedStores, nearbyStores] = await Promise.all([
      this.storeRepository.getHeroBanner(),
      this.storeRepository.getCategories(),
      this.storeRepository.getRecommendedStores(),
      this.storeRepository.getNearbyStores(),
    ]);

    return { heroBanner, categories, recommendedStores, nearbyStores };
  }
}
