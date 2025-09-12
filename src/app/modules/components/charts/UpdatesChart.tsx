import React from "react";
import "./UpdatesChart.css";
import {
  DetailLabels,
  LabelTitleSemibold1,
} from "../common/formsLabels/detailLabels";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
import dayjs from "dayjs";

interface UpdateItem {
  title: string;
  status: string;
  date: string;
  severity: "high" | "medium" | "low";
}

interface UpdatesChartProps {
  title?: string;
  data: UpdateItem[];
  height?: number;
  className?: string;
  showBorder?: boolean;
}

const UpdatesChart: React.FC<UpdatesChartProps> = ({
  title = "التحديثات",
  data = [],
  height = 350,
  className = "",
  showBorder = false,
}) => {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY/MM/DD");
  };
  return (
    <div className={`notification-timeline-container ${className}`}>
      <div className="card MOD-Card">
        <div className="card-header" style={{ minHeight: "auto" }}>
          <div className="notification-header mb-5">
            <LabelTitleSemibold1 text={title} />
          </div>
        </div>

        <div className="card-body px-0">
          <div className="notification-content">
            {data.length === 0 ? (
              <div className="notification-timeline-empty">
                <NoRecordsAvailable />
              </div>
            ) : (
              <div className="updates-content">
                {!data || data.length === 0 ? (
                  <div className="notification-timeline-empty">
                    <NoRecordsAvailable />
                  </div>
                ) : (
                  <div className="notification-timeline-list">
                    <div className="scrollable-notifications">
                      {data.map((item: UpdateItem, idx: number) => (
                        <div className="updates-timeline-item" key={idx}>
                          <div
                            className={`${item.severity.toLowerCase()}-priority-ar bullet w-10px h-10px rounded-2 mt-2 p-0`}
                            // className={`bullet w-10px h-10px rounded-2 mt-2 ${
                            //   item.severity === "high"
                            //     ? "action-required-high"
                            //     : item.severity === "medium"
                            //     ? "action-required-medium"
                            //     : "action-required-low"
                            // }`}
                            style={{
                              minWidth: "10px",
                              minHeight: "10px",
                              marginRight: "12px",
                            }}
                          ></div>
                          <div className="updates-timeline-item-content">
                            <div className="updates-service-info">
                              <div className="updates-service-name px-3">
                                <DetailLabels
                                  text={item.title}
                                  customClassName="lbl-txt-semibold-light"
                                />
                              </div>
                              <div className="updates-service-status px-3">
                                <DetailLabels
                                  text={item.status}
                                  customClassName="lbl-txt-semibold-light"
                                />
                              </div>
                            </div>
                            <div className="updates-date px-3">
                              <DetailLabels
                                text={formatDate(item.date)}
                                customClassName="lbl-txt-semibold-light"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesChart;
