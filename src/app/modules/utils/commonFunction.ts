import { Row, MyObject } from "../../models/row";

class CommonFunctions {

    groupDataByColumn(data: Row[], columnName: string, isObject: boolean) {
        let grouped = new Map<string, Row[]>();

        if (isObject) {
            for (let row in data) {

                if (grouped.get(data[row][columnName]["lookupCode"]) == undefined)
                    var tempArray: Row[] | undefined = [data[row]];
                else {
                    var tempArray: Row[] | undefined = grouped.get(data[row][columnName]["lookupCode"]);
                    if (tempArray)
                        tempArray.push(data[row]);
                }
                if (tempArray)
                    grouped.set(data[row][columnName]["lookupCode"], tempArray);

            }
        }
        else {
            for (let row in data) {

                if (grouped.get(data[row][columnName]) == undefined)
                    var tempArray: Row[] | undefined = [data[row]];
                else {
                    var tempArray: Row[] | undefined = grouped.get(data[row][columnName]);
                    if (tempArray)
                        tempArray.push(data[row]);
                }
                if (tempArray)
                    grouped.set(data[row][columnName], tempArray);

            }
        }



        return grouped
    }

    countDataByColumnName(data: Row[], columnName: string, isObject: boolean, isPriorities?: boolean) {
        let grouped = new Map<string, CountObject>();
        for (let row in data) {

            if (isObject) {
                if (grouped.get(data[row][columnName]["lookupCode"]) == undefined) {
                    var countObject = new CountObject();
                    countObject.myObject = <MyObject>(data[row][columnName]);
                    grouped.set(data[row][columnName]["lookupCode"], countObject);
                }
                else {
                    var tempCountObject = grouped.get(data[row][columnName]["lookupCode"]);
                    if (tempCountObject) {
                        tempCountObject.count++;
                        grouped.set(data[row][columnName]["lookupCode"], tempCountObject);
                    }
                }
            }
            else {
                if (grouped.get(data[row][columnName]) == undefined) {
                    var countObject = new CountObject();
                    countObject.myObject = <MyObject>(data[row][columnName]);
                    grouped.set(data[row][columnName], countObject);
                }
                else {
                    var tempCountObject = grouped.get(data[row][columnName]["lookupCode"]);
                    if (tempCountObject) {
                        tempCountObject.count++;
                        grouped.set(data[row][columnName], tempCountObject);
                    }
                }
            }
        }

        if (isPriorities) {
            if (grouped.get("urgent") == undefined) {
                var countObject = new CountObject();
                countObject.count = 0;
                countObject.myObject = <MyObject>({ lookupCode: "urgent", lookupName: "Urgent", lookupNameAr: "عاجل" });
                grouped.set("urgent", countObject);
            }
            if (grouped.get("normal") == undefined) {
                var countObject = new CountObject();
                countObject.count = 0;
                countObject.myObject = <MyObject>({ lookupCode: "normal", lookupName: "Normal", lookupNameAr: "عادي" });
                grouped.set("normal", countObject);
            }
        }

        return grouped
    }


    tryEval(code: string) {
        try {
            return eval(code);
        } catch (e) {
            console.log("tryEval " + code + " - Error " + e);
            return "";
        }

    }
}

class CountObject { count: number = 1; myObject: MyObject = { lookupCode: "", lookupName: "", lookupNameAr: "", colorCode: "", imageUrl: "", lookupId: null, lookupType: "" } }

export default CommonFunctions;