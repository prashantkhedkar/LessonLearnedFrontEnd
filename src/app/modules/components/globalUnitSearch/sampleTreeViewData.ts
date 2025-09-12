export interface RenderTree {
    id: string;
    name: string;
    children?: RenderTree[];
    parentUnitId?: string;
  }

  export const InitialTreeData : RenderTree = {
    id: "",
    name: "",
    parentUnitId: ""
  }
  
  export const data: RenderTree = {
    id: "2001",
    name: "Main Unit",
    children: [
      {
        id: "1",
        name: "Child - 1"
      },
      {
        id: "3",
        name: "Child - 3",
        children: [
          {
            id: "4",
            name: "Child - 4",
            children: [
              {
                id: "7",
                name: "Child - 7"
              },
              {
                id: "8",
                name: "Child - 8"
              }
            ]
          }
        ]
      },
      {
        id: "5",
        name: "Child - 5",
        children: [
          {
            id: "6",
            name: "Child - 6"
          }
        ]
      }
    ]
  };
  