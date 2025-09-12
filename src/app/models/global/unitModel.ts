
export interface IUnitSearchModel {          
      name: string
    , pageNumber: number
    , rowsPerPage: number
}

export interface ILeaveRequestApproverSearchModel {          
  name: string
, pageNumber: number
, rowsPerPage: number
}

export interface UnitModel {
  id: number;
  name: string;
  type?: TranslationModel;
  status?: TranslationModel;
  leaderId?: number;
  leader?: UnitPersonModel;
  viceLeader?: UnitPersonModel;
  qalamObj?: UnitPersonModel;
  parentUnitId?: number;
  level?: number;
  totalRowCount?: number;
  mainUnitId?: number;
  isMainUnit?: boolean;
}

export interface TranslationModel {
     id?:number
   , ar?: string
   , en?: string
 }

 export interface UnitPersonModel {
    id?: number
  , name?: string
  , rank?: string
  , militaryNumber?: number
  , position?: TranslationModel
}
