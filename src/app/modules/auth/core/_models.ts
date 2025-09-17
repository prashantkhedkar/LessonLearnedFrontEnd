import { RoleModel } from './_rbacModels';

export interface AuthModel {
  atkn: string;  
  displayNameEn: string;
  displayNameAr: string;  
  jwtToken: string;
  rankNameEn: string;
  rankNameAr: string;  
  refreshToken: string;
  userName: string;
  roleId?: number;
  expireIn?: string;
  unitId: string;
  unitLogo: string;
  unitName: string;
  unitNameAr: string;
  jobTitleAr: string;
  jobTitleEn: string;
  pId: number;
  militaryType:string;
  gender:string;
  roles?: RoleModel[]; // Add user roles to auth model
}

export interface AuthRefreshTokenModel {
  jwtToken: string;
  refreshToken: string;

}
export interface UserAddressModel {
  addressLine: string;
  city: string;
  state: string;
  postCode: string;
}

export interface UserCommunicationModel {
  email: boolean;
  sms: boolean;
  phone: boolean;
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean;
  sendCopyToPersonalEmail?: boolean;
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean;
    youAreSentADirectMessage?: boolean;
    someoneAddsYouAsAsAConnection?: boolean;
    uponNewOrder?: boolean;
    newMembershipApproval?: boolean;
    memberRegistration?: boolean;
  };
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean;
    tipsOnGettingMoreOutOfKeen?: boolean;
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean;
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean;
    tipsOnStartBusinessProducts?: boolean;
  };
}

export interface UserSocialNetworksModel {
  linkedIn: string;
  facebook: string;
  twitter: string;
  instagram: string;
}

// export interface UserModel {
//   id: string
//   username: string
//   password?: string | undefined
//   //email: string
//   //first_name: string
//   //last_name: string
//   //fullname?: string
//   //occupation?: string
//   //companyName?: string
//   //phone?: string
//   //roles?: Array<number>
//   //pic?: string
//   //language?: 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'ru'
//   //timeZone?: string
//   //website?: 'https://keenthemes.com'
//   //emailSettings?: UserEmailSettingsModel
//   //auth?: AuthModel
//   //communication?: UserCommunicationModel
//   //address?: UserAddressModel
//   //socialNetworks?: UserSocialNetworksModel
// }
