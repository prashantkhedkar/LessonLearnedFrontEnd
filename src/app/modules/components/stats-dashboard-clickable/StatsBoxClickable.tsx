import cssStatsBox from './statsBoxClickable.module.css';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';

interface props {
    title: string
    data: string
    imageUrl: string
    iconBgColor?: string
    cssClassName?: string
    onClickable: Function
    itemId?: string
}
// Add your own column and row spacing to the main component and inject below component.
export default function StatsBoxClickable({ title, data, imageUrl, iconBgColor = "", cssClassName = "", onClickable, itemId }: props) {
    const lang = useLang();

    return (
        <div className={cssStatsBox["statInner"]}>
            <div className={`card mb-5 ${cssStatsBox["duepadding"]} `}>
                <div className="container">
                    <div className='row'>
                        <div className={`col-sm-12 col-md-12 ${cssStatsBox["statsbox-text-col-container"]}`}
                            onClick={(e) => onClickable(e, itemId)}>
                            <div className={`${cssStatsBox["icon-container"]} ${cssStatsBox[cssClassName]}`}
                                style={{ background: iconBgColor, display: 'inline', float: lang == "ar" ? 'right' : 'left' }}>
                                <img
                                    src={toAbsoluteUrl('/media/svg/mod-specific/' + imageUrl)}
                                    className={`${cssStatsBox["img"]}`}
                                    alt='img'
                                    onError={(event) => (event.target as HTMLImageElement).style.display = 'none'}
                                />
                            </div>
                            <div style={{
                                display: 'inline',
                                float: lang == "ar" ? 'right' : 'left',
                                paddingLeft: lang == "ar" ? '' : '13px',
                                paddingRight: lang == "ar" ? '13px' : ''
                            }}>
                                <div className={` ${lang === "ar" ? cssStatsBox['icon-text-containerAR'] : cssStatsBox['icon-text-containerEn']}`}>
                                    {title} <br />
                                </div>
                                <span className={cssStatsBox['label']}>
                                    {data}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
