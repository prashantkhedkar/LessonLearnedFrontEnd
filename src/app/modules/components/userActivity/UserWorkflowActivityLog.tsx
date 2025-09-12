import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import { LabelSemibold6 } from '../common/formsLabels/detailLabels';
import { unwrapResult } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { useAppDispatch } from '../../../../store';
import { IUserActivityModel } from '../../../models/global/globalGeneric';
import { memo, useEffect, useState } from "react";
import DOMPurify from 'dompurify';
import { auto } from '@popperjs/core';
import NoRecordsAvailable from '../noRecordsAvailable/NoRecordsAvailable';
import { generateUUID } from '../../utils/common';
import { motion } from 'framer-motion';
import { fadeInUpInnerDiv } from '../../../variantes';

interface props {
  recordId: number;
  height?: string;
  title: string;
  moduleTypeId: number;
  userId: string;
}
export default memo(function UserWorkflowActivityLog({ recordId, height = "350px", title, moduleTypeId, userId }: props) {
  const [getUserTimelineActivity, setUserTimelineActivity] = useState<IUserActivityModel[]>([]);
  const dispatch = useAppDispatch();
  const lang = useLang();

  useEffect(() => {
    const topNth = 10;

    

  }, []);

  return (
    <>
      <motion.div
        variants={fadeInUpInnerDiv}
        initial="initial"
        animate="animate" className="">
        <div className="" style={{ width: "100%", height: '380px' }}>
          <>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <div className={`mb-9`}>
                  <LabelSemibold6 text={title} />
                </div>
              </div>
            </div>
            <div className="row" style={{ overflow: auto, height: height }}>
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
                      <TimelineItem key={generateUUID() + i.toString()}>
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
                            {
                              item.durationSinceLastActivity &&
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(item.durationSinceLastActivity),
                                }}>
                              </span>
                            }
                          </Typography>
                          <Typography sx={{ fontFamily: "Roboto-Regular", fontSize: "14px" }}>
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
                {
                  (!getUserTimelineActivity || getUserTimelineActivity.length === 0) &&
                  <>
                    <NoRecordsAvailable />
                  </>
                }
              </div>
            </div>
          </>
        </div >
      </motion.div>
    </>
  );
});

