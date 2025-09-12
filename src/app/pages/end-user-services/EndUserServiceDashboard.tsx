import { unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import { useAppDispatch } from '../../../store';
import { ServiceModel } from '../../models/global/serviceModel';
import { GetServiceRequestList } from '../../modules/services/globalSlice';
import { ServiceFormDynamicTemplate } from './forms/ServiceFormDynamicTemplate';

export default function EndUserServiceDashboard() {
    const intl = useIntl();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const tableRef = useRef<any>(null);
    const [tableData, setTableData] = useState<ServiceModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedService, setSelectedService] = useState<ServiceModel | null>(null);
    const [showNewServiceForm, setShowNewServiceForm] = useState<boolean>(false);
    const [submittedServices, setSubmittedServices] = useState<ServiceModel[]>([]);
    const [draftServices, setDraftServices] = useState<ServiceModel[]>([]);
    const [activeTab, setActiveTab] = useState<string>('submitted');

    useEffect(() => {
        fetchServicesByStatus(0);
    }, []);

    const fetchServicesByStatus = (statusValue: number | null) => {
        setLoading(true);
        dispatch(GetServiceRequestList())
            .then(unwrapResult)
            .then((orginalPromiseResult) => {
                if (orginalPromiseResult.statusCode === 200) {
                    const categories = orginalPromiseResult.data as ServiceModel[];

                    if (categories) {
                        let filtered = categories;
                        if (statusValue === 0) {
                            filtered = categories.filter(c => c.status === 0);
                        } else if (statusValue !== null) {
                            filtered = categories.filter(c => c.status !== 0);
                        }

                        if (statusValue === 0) {
                            setDraftServices(filtered);
                        } else {
                            setSubmittedServices(filtered);
                        }

                        if (tableRef.current) {
                            const mappedData = filtered.map(category => ({
                                id: category.serviceId,
                                ...category
                            }));
                            tableRef.current.setData(mappedData);
                            tableRef.current.setTotalRows(filtered.length);
                        }
                    }
                } else {
                    console.error("fetching data error");
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("fetching data error");
                setLoading(false);
            });
    };

    useEffect(() => {
        const handleTableRowClick = (event: Event) => {
            const target = event.target as HTMLElement;
            const row = target.closest('tr');

            if (row && row.getAttribute('id')) {
                const rowId = Number(row.getAttribute('id'));
                const category = tableData.find(c => c.serviceId === rowId);

                if (category) {
                    setSelectedService(category);
                    setShowNewServiceForm(false);
                }
            }
        };

        const tableElement = document.querySelector('.data-table-container');
        if (tableElement) {
            tableElement.addEventListener('click', handleTableRowClick as EventListener)
        }
    }, [tableData]);

    return (
        <>
            <div>EndUserServiceDashboard</div>
            {/* <ServiceFormDynamicTemplate serviceId={4} entityId={3} /> */}
        </>
    )
}