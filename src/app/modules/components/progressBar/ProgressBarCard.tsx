import React from 'react'
import cssModule from './ProgressBarCard.module.css';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { Typography } from '@mui/material';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import cssStatsBox from '../stats-dashboard/statsBox.module.css';
import { useIntl } from 'react-intl';
interface props {
    progressValue: number
}
// Add your own column and row spacing to the main component and inject below component.
export default function ProgressBarCard(props: LinearProgressProps & { value: number }) {
    const intl = useIntl();
    const lang = useLang();
    const primary = {
        main: '#F59E0B',
        light: '#D1D5DB',
        dark: '#D97706',
    };

    const styles = props => ({
        colorPrimary: {
            backgroundColor: '#00695C',
        },
        barColorPrimary: {
            backgroundColor: '#F59E0B',
        }
    });

    return (
        <div className={`card ${cssModule["duepadding"]} `}>
            <div className="card-title d-flex flex-column mb-0">
                <div className="align-items-center">
                    <div className='row'>
                        <div className='col-lg-12 col-md-12 col-sm-12'>
                            <div style={{ display: 'inline', width: '100%', float: lang == "ar" ? 'right' : 'left', paddingLeft: lang == "ar" ? '' : '13px', paddingRight: lang == "ar" ? '13px' : '' }}>
                                <div className={` ${lang === "ar" ? cssStatsBox['icon-text-containerAR'] : cssStatsBox['icon-text-containerEn']}`} style={{ paddingBottom: '5px' }}>
                                    {intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.PROGRESS' })}
                                </div>

                                <span className={cssStatsBox['label']}>
                                    <LinearProgress variant="determinate" {...props} classes={{ colorPrimary: '#00695C', barColorPrimary: '#D1D5DB' }} />
                                    <Typography variant="body2" color="black">{`${Math.round(props.value,)}%`}</Typography>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
