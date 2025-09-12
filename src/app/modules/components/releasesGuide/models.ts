export interface ReleaseNote {
  ReleaseAR: string;
  ReleaseEN: string;
  Date: string;
  Groups: Group[];
}

interface Group {
  GroupAR: string;
  GroupEN: string;
  Items: Item[];
}

interface Item {
  ItemAR: string;
  ItemEN: string;
}