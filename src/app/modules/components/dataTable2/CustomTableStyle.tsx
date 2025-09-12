export const customStyles = {
    headCells: { style: { padding: "0.5rem 1rem" } },
    table: {
        style: {
            boxShadow: "0px 1px 7px 0px rgba(0,0,0,0.25)",
        }
    },
    headRow: {
        style: {
            fontFamily: "HelveticaNeueLTArabic-Bold_2",
            fontSize: "16px",
            lineHeight: "24px",
            textAlign: "right" as const,
            color: "#1F2937",
            background: "#E5E7EB",
            borderTopLeftRadius: "0.375rem",
            borderTopRightRadius: "0.375rem",
        }
    },
    cells: {
        style: {
            background: "var(--pi-table-bg)",
            padding: "0.5rem 1rem !important",
            fontFamily: "HelveticaNeueLTArabic-Light_0",
            fontSize: "14px",
            lineHeight: "24px",
        }
    },
    pagination: {
        style: {
            justifyContent: "center",
            background: 'transparent',
            border: "0px",
            minHeight: 'auto !important',
            marginTop: "0.5rem !important",
            "& button:hover:not(:disabled)": {
                backgroundColor: "#B7945A !important",
            },
        }
    },
};