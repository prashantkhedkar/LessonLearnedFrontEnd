
import CountWidget from "./CountWidget";
import "./CountWidget.css";
import { useIntl } from 'react-intl';
import NoRecordsAvailable from '../noRecordsAvailable/NoRecordsAvailable';

type ManageFieldsProps = {
  filterByStatusId?: (statusId: string) => void;
  widgets: any[];
  scrollable?: boolean;
  onWidgetClick?: (widget: any) => void;
};

const CountWidgetList = ({ filterByStatusId, widgets, scrollable = false, onWidgetClick }: ManageFieldsProps) => {
  const intl = useIntl();

  const handleWidgetClick = (item: any) => {
    const statusIdStr = Array.isArray(item.statusId) ? item.statusId.join(",") : "";

    // Call the new click handler if provided
    if (onWidgetClick) {
      onWidgetClick(item);
    }
    // Keep the original behavior for backward compatibility
    else if (filterByStatusId) {
      filterByStatusId(statusIdStr);
    }
  };

  // Check if widgets data is empty or undefined
  if (!widgets || widgets.length === 0) {
    return (
      <div className="dashboard-count-widget-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        textAlign: 'center'
      }}>
        <NoRecordsAvailable />
      </div>
    );
  }

  return (
    <div className="dashboard-count-widget-container" >
      {widgets.map((item, index) => {
        const statusIdStr = Array.isArray(item.statusId) ? item.statusId.join(",") : "";
        return (
          <div
            className="col"
            //style={{ cursor: "pointer" }}
            onClick={() => handleWidgetClick(item)}
            key={index}
            data-status-id={statusIdStr}
          >
            <CountWidget key={index} {...item} />{" "}
          </div>
        );
      })}
    </div>
  );
};

export default CountWidgetList;
