import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddComments from "./addComments";
import { useEffect, useState } from "react";
import { IRequestActivityLogsModel } from "../../../models/global/globalGeneric";
import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../../../store";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
import SquarLoader from "../../../../app/modules/components/animation/SquarLoader";
import { getTimelineActivityByRequestId, saveTimelineActivity } from "../../services/serviceRequestSlice";
import DOMPurify from "dompurify";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

interface TimelineChartWithDetailsProps {
  isShowAddComments: boolean | false;
  requestId: number | 0;
  currentEntityId?: number | 0;
}
const TimelineActivityLogChartWithDetails = ({ isShowAddComments, requestId, currentEntityId }: TimelineChartWithDetailsProps) => {
  const [activityData, setActivityData] = useState<IRequestActivityLogsModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const lang = useLang();
  const regex = /(<([^>]+)>)/gi;
  
  useEffect(() => {
    fetchTimelineData();
  }, [requestId]);

  const fetchTimelineData = async () => {
    if (requestId) {
      setLoading(true);
      try {
        const result = await dispatch(getTimelineActivityByRequestId({ requestId }));
        const response = unwrapResult(result);
        if (response.statusCode === 200) {
          setActivityData(response.data || []);
        }
      } catch (error) {
        console.log('Error fetching timeline data: ', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitComments = async (comment: string) => {
    const timelineData = {
      actionDetails: comment,
      requestId: requestId,
      actionId: 0,
      logType: 1,
      entityId: currentEntityId!
    }

    try {
      setLoading(true);
      const result = await dispatch(saveTimelineActivity({ formDataObject: timelineData }));
      const response = unwrapResult(result);
      if (response.statusCode === 200) {
        await fetchTimelineData();
      }
    } catch (error) {
      console.error('Saving error ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column gap-2 timeline-vertical-border">
        {
          loading && <SquarLoader />
        }

        {
          !loading && activityData.length === 0 && <NoRecordsAvailable />
        }

        {!loading && activityData.map((item) => (
          <div className="d-flex align-items-start w-100 gap-6">
            <div className="d-flex align-items-center gap-3">
              <div className="timeline-circle-m">
                <div className="timeline-circle-inner-m" />
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <div className="timeline-line-horizontal"></div>
                <div className="timeline-tiny-circle-gold"></div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="d-flex align-items-center gap-3">
              <div className="font-bold-3 lh-sm2 text-primary-gold mt-1">
                {item.date}
              </div>
              <div className="timeline-tiny-circle-grey" />
              <div className="font-bold-3 lh-sm2 text-primary-gold mt-1">
                {item.time}
              </div>
              <FontAwesomeIcon icon={faAngleLeft} color="#BDBBBB" size="xl" />
            </div>

            {/* Description and Creator */}
            <div className="d-flex flex-column">
              <div className="font-bold-2 lh-sm2">
                <span
                  style={{ background: 'transparent' }}
                  className={` activityCommentText-` + lang}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.description.replace("<br></p>", "").replace("<p>", "")),
                  }}
                ></span>
              </div>
              <div className="font-2 lh-sm2">{item.createdBy}</div>
            </div>
          </div>
        ))}
      </div>
      {isShowAddComments && <AddComments onSubmit={handleSubmitComments} />}
    </>
  );
};

export { TimelineActivityLogChartWithDetails };
