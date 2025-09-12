import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { useAppDispatch } from '../../../../store';
import { IUserActivityModel } from '../../../models/global/globalGeneric';
import { memo, useEffect, useState } from "react";
import DOMPurify from 'dompurify';
import { auto } from '@popperjs/core';
import NoRecordsAvailable from '../noRecordsAvailable/NoRecordsAvailable';
import "./UserActivityTimeline.css"


interface props {
  recordId: number;
  moduleTypeId: number;
  userId: string;
  title: string;
  height?: string;
  refreshMeetings?: boolean;
  setRefreshMeetings?: any;
  setShowMRPopup?: any;
  setMeetingId?: any;
  setMeetingDate?: any;
}
const UserActivityTimeline = ({ recordId, moduleTypeId, userId, title, height = "350px", refreshMeetings, setRefreshMeetings, setShowMRPopup, setMeetingId, setMeetingDate }: props) => {
  const dispatch = useAppDispatch();
  const [getUserTimelineActivity, setUserTimelineActivity] = useState<IUserActivityModel[]>([]);

  const intl = useIntl();
  const lang = useLang();

  useEffect(() => {
    fetchUserActivityList(recordId, moduleTypeId, userId, 20);
  }, [refreshMeetings]);

  const fetchUserActivityList = (recordId: number, moduleTypeId: number, userId: string, topNth: number) => {
    try {

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>

      {/* <div className="" style={{ width: "100%", height: '380px' }}> */}
      <div className="row">
        <>
          {/* <div className="col-lg-12 col-md-12 col-sm-12">
                <div className={`mb-9}`}>
                  <LabelSemibold6 text={title} />
                </div>
              </div> */}

          {
            (!getUserTimelineActivity || getUserTimelineActivity.length === 0) ?
              <>
                <NoRecordsAvailable />
              </>
              : <>  <div className="row" style={{ overflow: auto, maxHeight: height }}>
                <div className="col-lg-12 col-md-12 col-sm-12">
                  <Timeline
                    sx={{
                      [`& .${timelineItemClasses.root}:before`]: {
                        flex: 0,
                        padding: 0,
                      },
                    }}
                    position={lang === "ar" ? "right" : undefined} >
                    {
                      getUserTimelineActivity &&
                      getUserTimelineActivity.length > 0 &&
                      getUserTimelineActivity.map((item, i) => (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot
                              sx={{ borderColor: moduleTypeId === 2 ? 'none' : '#c7ac7f !important' }}
                              className={item.notificationType}
                              variant={moduleTypeId === 2 ? "filled" : "outlined"}></TimelineDot>
                            <TimelineConnector
                              sx={{ bgcolor: moduleTypeId === 2 ? 'none' : '#c7ac7f' }}
                              className={item.notificationType}
                            />
                          </TimelineSeparator>
                          <TimelineContent sx={{ py: '5px', px: '15px', textAlign: (lang === "ar" ? "right" : "left") }}>
                            <Typography variant="body1" component="span" className='lbl-Title-semibold-1-black'>
                              
                            </Typography>
                            <Typography sx={{ fontFamily: lang === "en" ? "Roboto-Regular" : "HelveticaNeueLTArabic-Light_0", fontSize: "14px" }}>
                              {
                                item.bodyText &&
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(item.bodyText),
                                  }}>
                                </span>
                              }
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))
                    }
                  </Timeline>

                </div>
              </div></>
          }

        </>
      </div>
      {/* </div > */}

    </>
  );
};

export default memo(UserActivityTimeline);
