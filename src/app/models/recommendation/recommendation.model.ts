// Recommendation Model Interfaces and Types

export interface IRecommendation {
  recommendationId: number;
  observationId: number;
  observation: any | null; // You can define a proper IObservation interface if needed
  observationTitle: string;
  conclusion: string;
  recommendationText: string;
  discussion: string;
  combatFunction: number;
  level: number;
  createdDate: string; // ISO date string
  updatedDate: string | null; // ISO date string or null
  createdBy: number;
  updatedBy: number | null;
  isActive: boolean | null;
}

// For creating new recommendations (without readonly fields)
export interface ICreateRecommendation {
  observationId: number;
  observationTitle: string;
  conclusion: string;
  recommendationText: string;
  discussion: string;
  combatFunction: number;
  level: number;
}

// For updating recommendations
export interface IUpdateRecommendation extends ICreateRecommendation {
  recommendationId: number;
}

// Response type for API calls
export interface IRecommendationResponse {
  statusCode: number;
  data: IRecommendation[];
  message?: string;
}

// Class implementation for better type safety and methods
export class Recommendation implements IRecommendation {
  recommendationId: number;
  observationId: number;
  observation: any | null;
  observationTitle: string;
  conclusion: string;
  recommendationText: string;
  discussion: string;
  combatFunction: number;
  level: number;
  createdDate: string;
  updatedDate: string | null;
  createdBy: number;
  updatedBy: number | null;
  isActive: boolean | null;

  constructor(data: IRecommendation) {
    this.recommendationId = data.recommendationId;
    this.observationId = data.observationId;
    this.observation = data.observation;
    this.observationTitle = data.observationTitle;
    this.conclusion = data.conclusion;
    this.recommendationText = data.recommendationText;
    this.discussion = data.discussion;
    this.combatFunction = data.combatFunction;
    this.level = data.level;
    this.createdDate = data.createdDate;
    this.updatedDate = data.updatedDate;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.isActive = data.isActive;
  }

  // Helper method to get formatted created date
  getFormattedCreatedDate(): string {
    return new Date(this.createdDate).toLocaleDateString();
  }

  // Helper method to get formatted updated date
  getFormattedUpdatedDate(): string | null {
    return this.updatedDate ? new Date(this.updatedDate).toLocaleDateString() : null;
  }

  // Helper method to check if recommendation is active
  getIsActive(): boolean {
    return this.isActive === true;
  }

  // Method to convert to create/update payload
  toCreatePayload(): ICreateRecommendation {
    return {
      observationId: this.observationId,
      observationTitle: this.observationTitle,
      conclusion: this.conclusion,
      recommendationText: this.recommendationText,
      discussion: this.discussion,
      combatFunction: this.combatFunction,
      level: this.level,
    };
  }

  // Method to convert to update payload
  toUpdatePayload(): IUpdateRecommendation {
    return {
      ...this.toCreatePayload(),
      recommendationId: this.recommendationId,
    };
  }

  // Static method to create from API response
  static fromApiResponse(data: any): Recommendation {
    return new Recommendation({
      recommendationId: data.recommendationId || data.id || 0,
      observationId: data.observationId || 0,
      observation: data.observation || null,
      observationTitle: data.observationTitle || '',
      conclusion: data.conclusion || '',
      recommendationText: data.recommendationText || '',
      discussion: data.discussion || '',
      combatFunction: data.combatFunction || 0,
      level: data.level || 0,
      createdDate: data.createdDate || new Date().toISOString(),
      updatedDate: data.updatedDate || null,
      createdBy: data.createdBy || 0,
      updatedBy: data.updatedBy || null,
      isActive: data.isActive,
    });
  }

  // Static method to create array from API response
  static fromApiResponseArray(dataArray: any[]): Recommendation[] {
    return dataArray.map(item => Recommendation.fromApiResponse(item));
  }
}