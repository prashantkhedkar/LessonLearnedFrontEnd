import React from 'react';
import { useIntl } from 'react-intl';
import styles from './Pagination.module.css'; 
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import RenderFontAwesome from '../../utils/RenderFontAwesome';

function Pagination(props: {
    numberOfPages: number;
    currentPage: number;
    onPageChange: (pageNumber: number) => void;
    maxButtons?:number;
}) {

    const lang = useLang();

    const intl = useIntl();
    if (!props.numberOfPages || props.numberOfPages <= 1) {
        return null;
    }


    const getPageButtons = () => {
        const buttons: React.ReactElement[] = [];
        const maxButtons = props.maxButtons?props.maxButtons:11;
        const halfMaxButtons = Math.floor(maxButtons / 2);

        let startPage = Math.max(1, props.currentPage - halfMaxButtons);
        let endPage = Math.min(props.numberOfPages, startPage + maxButtons - 1);

        startPage = Math.max(1, endPage - maxButtons + 1);

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => props.onPageChange(i)}
                    className={styles.ldmsPaginationButton+" "+(props.currentPage === i ? styles.ldmsPaginationActive : '')}
                    disabled={props.currentPage === i}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };


    return (
        <div className={`customPagiantion ${styles.ldmsPagination}`}>
            <button
            className={styles.ldmsPaginationButton}
                onClick={() => props.onPageChange(1)}
                disabled={props.currentPage === 1}
            >
                  <RenderFontAwesome marginInlineEnd='3px' display size='lg' icon={lang=="en"?"backwardStep":"forwardStep"}/>
                {intl.formatMessage({ id: 'First' })}
            </button>
            <button
             className={styles.ldmsPaginationButton}
                onClick={() => props.onPageChange(props.currentPage - 1)}
                disabled={props.currentPage === 1}
            >
                <RenderFontAwesome marginInlineEnd='3px' display size='lg' icon={lang=="en"?"caretLeft":"caretRight"}/>
                {intl.formatMessage({ id: 'Prev' })}
            </button>
            {getPageButtons()}
            <button
             className={styles.ldmsPaginationButton}
                onClick={() => props.onPageChange(props.currentPage + 1)}
                disabled={props.currentPage === props.numberOfPages}
            >
               
                {intl.formatMessage({ id: 'Next' })}
                <RenderFontAwesome marginInlineStart='3px' display size='lg' icon={lang=="ar"?"caretLeft":"caretRight"}/>
            </button>
            <button
             className={styles.ldmsPaginationButton}
                onClick={() => props.onPageChange(props.numberOfPages)}
                disabled={props.currentPage === props.numberOfPages}
            >
                {intl.formatMessage({ id: 'Last' })}
                <RenderFontAwesome marginInlineStart='3px' display size='lg' icon={lang=="ar"?"backwardStep":"forwardStep"}/>
            </button>
        </div>
    );
}

export default Pagination;
