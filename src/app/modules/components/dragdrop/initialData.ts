interface FieldLayout{
    fields : {id: string; label: string}[];
    columns: {id: string; title: string; fieldIds : string[]}[];
    columnOrder: string[];
}

const initialData: FieldLayout = {
    fields: [
        {id : "1", label : "Task-11" },
        {id : "2", label : "Task-22" },
        {id : "3", label : "Task-33" },
        {id : "4", label : "Task-44" },
        {id : "5", label : "Task-55" },
        {id : "6", label : "Task-66" },
    ],
    columns: [
        {id: "1" , title: "Column 1" , fieldIds: ["1","2"]},
        {id: "2" , title: "Column 2" , fieldIds: ["3","4","5","6"]},
 
    ],
    columnOrder:  ["1","2"]
};

export default initialData;