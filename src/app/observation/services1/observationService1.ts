import {
  ObservationModel,
  ArticleListModel,
  ArticleSearchModel,
  ArticleCreateUpdateModel,
  ArticleStatsModel,
  ArticleHistoryModel,
  ArticleLookupModel,
  SubmitArticleRequest,
  ApproveArticleRequest,
  RejectArticleRequest,
  ArchiveArticleRequest,
  ArticleApiResponse,
} from "../models/observationModel";
import { requests } from "../../helper/axiosInterceptor";
import { responseType } from "../../models/global/responseResult";

class ObservationService {
  private baseURL = "/Observation";

  // Get articles with search and pagination
  async getArticles(
    searchParams: ArticleSearchModel
  ): Promise<ArticleApiResponse<ObservationModel[]>> {
    try {
      console.log(
        "🌐 Making API call to articles search with params:",
        searchParams
      );
      const response = await requests.post<responseType>(
        `${this.baseURL}/search`,
        searchParams
      );

      console.log("📡 Raw API response for articles:", response);

      if (response.statusCode === 200 && response.data) {
        // API returns articles directly as an array
        const articlesArray = Array.isArray(response.data)
          ? response.data
          : [];

        const result = {
          success: true,
          message: response.message || "Articles retrieved successfully",
          data: articlesArray as ObservationModel[],
          statusCode: response.statusCode,
        };
        console.log("✅ Returning formatted articles response:", result);
        return result;
      } else {
        console.log("❌ Articles API response failed:", response);
        return {
          success: false,
          message: response.message || "Failed to fetch articles",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      return {
        data: [],
        success: false,
        message: error.message || "Failed to fetch articles",
        statusCode: 500,
      };
    }
  }

  async getAllArticles(): Promise<ArticleApiResponse<ObservationModel[]>> {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetAllArticles`
      );

      console.log("📡 Raw API response for articles:", response);

      if (response.statusCode === 200 && response.data) {
        // API returns articles directly as an array
        const articlesArray = Array.isArray(response.data)
          ? response.data
          : [];

        const result = {
          success: true,
          message: response.message || "Articles retrieved successfully",
          data: articlesArray as ObservationModel[],
          statusCode: response.statusCode,
        };
        console.log("✅ Returning formatted articles response:", result);
        return result;
      } else {
        console.log("❌ Articles API response failed:", response);
        return {
          success: false,
          message: response.message || "Failed to fetch articles",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      return {
        data: [],
        success: false,
        message: error.message || "Failed to fetch articles",
        statusCode: 500,
      };
    }
  }

  // Get observation by ID
  async getArticleById(
    articleId: number
  ): Promise<ArticleApiResponse<ObservationModel>> {
    try {
      const response = await requests.get<responseType>(
        `${this.baseURL}/GetArticleById/${articleId}`
      );

      if (response.statusCode === 200 && response.data) {
        return {
          success: true,
          message: response.message || "Article retrieved successfully",
          data: response.data as any as ObservationModel,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Article not found",
          statusCode: response.statusCode || 404,
        };
      }
    } catch (error) {
      console.error("Error fetching observation:", error);
      return {
        success: false,
        message: "Failed to fetch observation",
        statusCode: 500,
      };
    }
  }

  // Create new observation
  async createArticle(
    observation: ArticleCreateUpdateModel
  ): Promise<ArticleApiResponse<{ articleId: number }>> {
    try {
        debugger;
      const response = await requests.post<
        ArticleApiResponse<{ articleId: number }>
      >(`${this.baseURL}/Create?submissionStatus=Draft`, observation);
      return response;
    } catch (error) {
      console.error("Error creating observation:", error);
      return {
        success: false,
        message: "Failed to create observation",
        statusCode: 500,
      };
    }
  }

  // Update existing observation
  async updateArticle(
    articleId: number,
    observation: ArticleCreateUpdateModel
  ): Promise<ArticleApiResponse<void>> {
    try {
      const response = await requests.put<ArticleApiResponse<void>>(
        `${this.baseURL}/${articleId}/UpdateArticle`,
        observation
      );
      return response;
    } catch (error) {
      console.error("Error updating observation:", error);
      return {
        success: false,
        message: "Failed to update observation",
        statusCode: 500,
      };
    }
  }

  // Delete observation
  async deleteArticle(
    articleId: number
  ): Promise<ArticleApiResponse<void>> {
    try {
      const response = await requests.delete<ArticleApiResponse<void>>(
        `${this.baseURL}/DeleteArticle/${articleId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting observation:", error);
      return {
        success: false,
        message: "Failed to delete observation",
        statusCode: 500,
      };
    }
  }

  // Submit observation
  async submitArticle(
    articleId: number,
    notes?: string
  ): Promise<ArticleApiResponse<void>> {
    try {
      const request: SubmitArticleRequest = { notes };
      const response = await requests.put<ArticleApiResponse<void>>(
        `${this.baseURL}/${articleId}/submit`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error submitting observation:", error);
      return {
        success: false,
        message: "Failed to submit observation",
        statusCode: 500,
      };
    }
  }

  // Approve observation
  async approveArticle(
    articleId: number,
    notes?: string
  ): Promise<ArticleApiResponse<void>> {
    try {
      const request: ApproveArticleRequest = { notes };
      const response = await requests.put<ArticleApiResponse<void>>(
        `${this.baseURL}/${articleId}/approve`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error approving observation:", error);
      return {
        success: false,
        message: "Failed to approve observation",
        statusCode: 500,
      };
    }
  }

  // Reject observation
  async rejectArticle(
    articleId: number,
    reason: string,
    notes?: string
  ): Promise<ArticleApiResponse<void>> {
    try {
      const request: RejectArticleRequest = { reason, notes };
      const response = await requests.put<ArticleApiResponse<void>>(
        `${this.baseURL}/${articleId}/reject`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error rejecting observation:", error);
      return {
        success: false,
        message: "Failed to reject observation",
        statusCode: 500,
      };
    }
  }

  // Archive observation
  async archiveArticle(
    articleId: number,
    reason: string
  ): Promise<ArticleApiResponse<void>> {
    try {
      const request: ArchiveArticleRequest = { reason };
      const response = await requests.put<ArticleApiResponse<void>>(
        `${this.baseURL}/${articleId}/archive`,
        request
      );
      return response;
    } catch (error) {
      console.error("Error archiving observation:", error);
      return {
        success: false,
        message: "Failed to archive observation",
        statusCode: 500,
      };
    }
  }

  // Get observation history
  async getArticleHistory(
    articleId: number
  ): Promise<ArticleApiResponse<ArticleHistoryModel[]>> {
    try {
      const response = await requests.get<
        ArticleApiResponse<ArticleHistoryModel[]>
      >(`${this.baseURL}/GetArticlesHistory`);
      return response;
    } catch (error) {
      console.error("Error fetching observation history:", error);
      return {
        success: false,
        message: "Failed to fetch observation history",
        statusCode: 500,
      };
    }
  }

  // Get observation statistics
  async getArticleStats(): Promise<
    ArticleApiResponse<ArticleStatsModel>
  > {
    try {
      const response = await requests.get<
        ArticleApiResponse<ArticleStatsModel>
      >(`${this.baseURL}/GetArticleStats`);
      return response;
    } catch (error) {
      console.error("Error fetching observation stats:", error);
      return {
        success: false,
        message: "Failed to fetch observation stats",
        statusCode: 500,
      };
    }
  }

  // Get lookup data for dropdowns
  async getLookupData(): Promise<
    ArticleApiResponse<ArticleLookupModel>
  > {
    try {
      const response = await requests.get<
        ArticleApiResponse<ArticleLookupModel>
      >(`${this.baseURL}/GetLookupData`);
      return response;
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      return {
        success: false,
        message: "Failed to fetch lookup data",
        statusCode: 500,
      };
    }
  }

  // Check observation title availability
  async checkArticleTitleAvailability(
    title: string,
    excludeArticleId?: number
  ): Promise<ArticleApiResponse<{ isAvailable: boolean }>> {
    try {
      const params = new URLSearchParams({ title });
      if (excludeArticleId) {
        params.append(
          "excludeArticleId",
          excludeArticleId.toString()
        );
      }
      const response = await requests.get<
        ArticleApiResponse<{ isAvailable: boolean }>
      >(`${this.baseURL}/CheckArticleTitleAvailability?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Error checking observation title availability:", error);
      return {
        success: false,
        message: "Failed to check observation title availability",
        statusCode: 500,
      };
    }
  }
}

// Export singleton instance
export const observationService = new ObservationService();
export default observationService;
