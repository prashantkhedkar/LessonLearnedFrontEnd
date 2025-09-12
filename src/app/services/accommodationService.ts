import {
  AccommodationModel,
  AccommodationListModel,
  AccommodationSearchModel,
  AccommodationCreateUpdateModel,
  AccommodationStatsModel,
  AccommodationHistoryModel,
  AccommodationLookupModel,
  BlockAccommodationRequest,
  UnblockAccommodationRequest,
  AccommodationApiResponse,
} from "../models/accommodation/accommodationModels";
import { requests } from "../helper/axiosInterceptor";
import { responseType } from "../models/global/responseResult";

class AccommodationService {
  private baseURL = "/Observation";

  // Get accommodations with search and pagination
  async getAccommodations(
    searchParams: AccommodationSearchModel
  ): Promise<AccommodationApiResponse<AccommodationModel[]>> {
    try {
      console.log(
        "🌐 Making API call to accommodations search with params:",
        searchParams
      );
      const response = await requests.post<responseType>(
        `${this.baseURL}/search`,
        searchParams
      );

      console.log("📡 Raw API response for accommodations:", response);

      if (response.statusCode === 200 && response.data) {
        // API returns accommodations directly as an array
        const accommodationsArray = Array.isArray(response.data)
          ? response.data
          : [];

        const result = {
          success: true,
          message: response.message || "Accommodations retrieved successfully",
          data: accommodationsArray as AccommodationModel[],
          statusCode: response.statusCode,
        };
        console.log("✅ Returning formatted accommodations response:", result);
        return result;
      } else {
        console.log("❌ Accommodations API response failed:", response);
        return {
          success: false,
          message: response.message || "Failed to fetch accommodations",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error fetching accommodations:", error);
      return {
        data: [],
        success: false,
        message: error.message || "Failed to fetch accommodations",
        statusCode: 500,
      };
    }
  }

  async getAvailableRooms(): Promise<
    AccommodationApiResponse<AccommodationModel[]>
  > {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetAvailableRooms`
      );

      console.log("📡 Raw API response for accommodations:", response);

      if (response.statusCode === 200 && response.data) {
        // API returns accommodations directly as an array
        const accommodationsArray = Array.isArray(response.data)
          ? response.data
          : [];

        const result = {
          success: true,
          message: response.message || "Accommodations retrieved successfully",
          data: accommodationsArray as AccommodationModel[],
          statusCode: response.statusCode,
        };
        console.log("✅ Returning formatted accommodations response:", result);
        return result;
      } else {
        console.log("❌ Accommodations API response failed:", response);
        return {
          success: false,
          message: response.message || "Failed to fetch accommodations",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error fetching accommodations:", error);
      return {
        data: [],
        success: false,
        message: error.message || "Failed to fetch accommodations",
        statusCode: 500,
      };
    }
  }

  // Get accommodation by ID
  async getAccommodationById(
    accommodationId: number
  ): Promise<AccommodationApiResponse<AccommodationModel>> {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetAccommodationById/${accommodationId}`
      );

      if (response.statusCode === 200 && response.data) {
        return {
          success: true,
          message: response.message || "Accommodation retrieved successfully",
          data: response.data as any as AccommodationModel,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Accommodation not found",
          statusCode: response.statusCode || 404,
        };
      }
    } catch (error) {
      console.error("Error fetching accommodation:", error);
      return {
        success: false,
        message: "Failed to fetch accommodation",
        statusCode: 500,
      };
    }
  }

  // Create new accommodation
  async createAccommodation(
    accommodation: AccommodationCreateUpdateModel
  ): Promise<AccommodationApiResponse<{ accommodationId: number }>> {
    try {
      const response = await requests.post<
        AccommodationApiResponse<{ accommodationId: number }>
      >(`${this.baseURL}/Create`, accommodation);
      return response;
    } catch (error) {
      console.error("Error creating accommodation:", error);
      return {
        success: false,
        message: "Failed to create accommodation",
        statusCode: 500,
      };
    }
  }

  // Update existing accommodation
  async updateAccommodation(
    accommodationId: number,
    accommodation: AccommodationCreateUpdateModel
  ): Promise<AccommodationApiResponse<void>> {
    try {
      const response = await requests.put<AccommodationApiResponse<void>>(
        `${this.baseURL}/${accommodationId}/UpdateAccommodation`,
        accommodation
      );
      return response;
    } catch (error) {
      console.error("Error updating accommodation:", error);
      return {
        success: false,
        message: "Failed to update accommodation",
        statusCode: 500,
      };
    }
  }

  // Delete accommodation
  async deleteAccommodation(
    accommodationId: number
  ): Promise<AccommodationApiResponse<void>> {
    try {
      const response = await requests.delete<AccommodationApiResponse<void>>(
        `${this.baseURL}/DeleteAccommodation/${accommodationId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      return {
        success: false,
        message: "Failed to delete accommodation",
        statusCode: 500,
      };
    }
  }

  // Block accommodation
  async blockAccommodation(
    accommodationId: number,
    reason: string
  ): Promise<AccommodationApiResponse<void>> {
    try {
      const request: BlockAccommodationRequest = { reason };
      const response = await requests.put<AccommodationApiResponse<void>>(
        `${this.baseURL}/${accommodationId}/block`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error blocking accommodation:", error);
      return {
        success: false,
        message: "Failed to block accommodation",
        statusCode: 500,
      };
    }
  }

  // Unblock accommodation
  async unblockAccommodation(
    accommodationId: number,
    reason: string
  ): Promise<AccommodationApiResponse<void>> {
    try {
      const request: UnblockAccommodationRequest = { reason };
      const response = await requests.put<AccommodationApiResponse<void>>(
        `${this.baseURL}/${accommodationId}/unblock`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error unblocking accommodation:", error);
      return {
        success: false,
        message: "Failed to unblock accommodation",
        statusCode: 500,
      };
    }
  }

  // Get accommodation history
  async getAccommodationHistory(
    accommodationId: number
  ): Promise<AccommodationApiResponse<AccommodationHistoryModel[]>> {
    try {
      const response = await requests.get<
        AccommodationApiResponse<AccommodationHistoryModel[]>
      >(`${this.baseURL}/GetAccommodationsHistory`);
      return response;
    } catch (error) {
      console.error("Error fetching accommodation history:", error);
      return {
        success: false,
        message: "Failed to fetch accommodation history",
        statusCode: 500,
      };
    }
  }

  // Get accommodation statistics
  async getAccommodationStats(): Promise<
    AccommodationApiResponse<AccommodationStatsModel>
  > {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetAccommodationStats`
      );

      if (response.statusCode === 200 && response.data) {
        return {
          success: true,
          message:
            response.message ||
            "Accommodation statistics retrieved successfully",
          data: response.data as any as AccommodationStatsModel,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message:
            response.message || "Failed to fetch accommodation statistics",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error) {
      console.error("Error fetching accommodation stats:", error);
      return {
        success: false,
        message: "Failed to fetch accommodation statistics",
        statusCode: 500,
      };
    }
  }

  // Get lookup data for dropdowns
  async getLookupData(): Promise<
    AccommodationApiResponse<AccommodationLookupModel>
  > {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetLookupData`
      );

      if (response.statusCode === 200 && response.data) {
        return {
          success: true,
          message: response.message || "Lookup data retrieved successfully",
          data: response.data as any as AccommodationLookupModel,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to fetch lookup data",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      return {
        success: false,
        message: "Failed to fetch lookup data",
        statusCode: 500,
      };
    }
  }

  // Check room name availability (updated from room number)
  async checkRoomNumberAvailability(
    roomNumber: string,
    excludeAccommodationId?: number
  ): Promise<AccommodationApiResponse<{ isAvailable: boolean }>> {
    try {
      const params = new URLSearchParams({ roomNumber });
      if (excludeAccommodationId) {
        params.append(
          "excludeAccommodationId",
          excludeAccommodationId.toString()
        );
      }
      const response = await requests.get<
        AccommodationApiResponse<{ isAvailable: boolean }>
      >(`${this.baseURL}/CheckRoomNumberAvailability?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Error checking room number availability:", error);
      return {
        success: false,
        message: "Failed to check room number availability",
        statusCode: 500,
      };
    }
  }
}

// Export singleton instance
export const accommodationService = new AccommodationService();
export default accommodationService;
