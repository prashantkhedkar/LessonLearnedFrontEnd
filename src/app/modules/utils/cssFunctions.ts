class CssFunctions {
    getPriorityClass(priority: string) {
        switch (priority) {
            case "Normal": return "normal";
            case "Urgent": return "urgent";
            case "Top Urgent": return "topurgent";
            case "Immediate": return "immediate";
            default: return "cellText";
        }
    };

    getProjectPriorityClass(priority: string) {
        switch (priority) {
            case "High": return "high";
            case "Medium": return "medium";
            case "Low": return "low";
            default: return "cellText";
        }
    };

    getTaskPriorityClass(priority: string) {
        switch (priority) {
            case "High": return "high";
            case "Medium": return "medium";
            case "Low": return "low";
            default: return "cellText";
        }
    };

    getStatusClass(status: string) {
        switch (status) {
            case "In-Progress": return "inProgress";
            case "On Hold": return "onHold";
            case "Not Started": return "notStarted";
            case "Completed": return "completed";
            case "Cancelled": return "notStarted";
            case "Rejected": return "rejected";
            default: return "cellText";
        }
    };

    getClassificationClass(status: string) {
        switch (status) {
            case "Top Secret": return "topSecret";
            case "Confidential": return "confidential";
            case "Secret": return "secret";
            case "Unclassified": return "unclassified";
            case "Concealed": return "concealed";
            default: return "cellText";
        }
    };

    getClassifictionIcon(name: string) {
        switch (name) {
            case "topSecret": return "faLock";
            case "secret": return "faCircleExclamation";
            case "unclassified": return "faCircle";
            case "confidential": return "faCircleMinus";
            case "concealed": return "faEyeSlash";
            default: return "";
        }
    };

    getDueDateClass(daysString: string, status?: any, moduleTypeId?: number) {
        const days: number = + daysString;
        // General Cases
        if (days < 0)
            return "days3minus";
        // else if (days < 0)
        //     return "days9minus";
        else if (days >= 0)
            return "days9plus";
        else
            return "cellText";
    };

    handleFormat(type: string, value: string, lang: string, intl?, status?: any, moduleTypeId?: number, row?: any) {
        // For Project Management & Task Management Modules, Config json with property Type = dueDate
        if (type == "dueDate") {
            var daysText = "MOD.COMPONENT.DAYS";

            if (Number(value) < 0) {
                if (lang == "ar") {
                    var daysText = Number(value) > 1 && Number(value) < 11 ? "MOD.COMPONENT.DAY" : "MOD.COMPONENT.DAYS";
                } else {
                    var daysText = Number(value) > 1 ? "MOD.COMPONENT.DAY" : "MOD.COMPONENT.DAYS";
                }
            } else {
                if (lang == "ar") {
                    var daysText = Number(value) > 1 && Number(value) < 11 ? "MOD.COMPONENT.DAYS" : "MOD.COMPONENT.DAY";
                } else {
                    var daysText = Number(value) > 1 ? "MOD.COMPONENT.DAYS" : "MOD.COMPONENT.DAY";
                }
            };
            
            const days = intl.formatMessage({ id: daysText });

            if (Number(value) < 0) {
                value = Math.abs(Number(value)).toString();
            } else {
                const leftText = intl.formatMessage({ id: "MOD.GENERIC.LEFT.DATE" });

                return (lang == 'ar') ?
                    (leftText + " " + value + " " + days)
                    :
                    (value + " " + days + " " + leftText);
            };
        } else {
            return value;
        }
    };

    progressBarColor(pregress: number) {
        if (pregress <= 33.33)
            return "danger";
        else if (pregress <= 66.66)
            return "warning";
        else
            return "success"
    };

    getStatusIcon(name: string) {
        switch (name) {
            case "inProgress": return "faClockFour";
            case "onHold": return "faCircleMinus";
            case "notStarted": return "faCircleDot";
            case "completed": return "faCheckCircle";
            case "cancelled": return "faXmarkCircle";
            default: return "";
        }
    };

    getOwnerClass(name: string) {
        return "";
    };

    getDueDateClassByDate(duedate: string) {
        let _dueDate = new Date(Number(duedate.split('/')[2]), Number(duedate.split('/')[1]) - 1, Number(duedate.split('/')[0]));
        let _today = new Date();
        _today.setHours(0, 0, 0, 0);
        if (_dueDate >= _today)
            return "validDate";
        else
            return "pastDate";
    };
}

export default CssFunctions;