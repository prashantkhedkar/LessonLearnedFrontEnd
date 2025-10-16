import React, { useState, useEffect } from 'react';
import {
    Button,
    Box,
    Typography,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { Modal } from 'react-bootstrap';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { HeaderLabels, LabelTextSemibold2, InfoLabels, BtnLabeltxtMedium2 } from '../../modules/components/common/formsLabels/detailLabels';
import { IRecommendationAction, IActionFormData } from '../../models/recommendation/action.model';
import dayjs from 'dayjs';
import { MUIDatePicker } from '../../modules/components/datePicker/MUIDatePicker';
import { generateUUID } from '../../modules/utils/common';
import DropdownListInModal from '../../modules/components/dropdown/DropdownListInModal';
import { useAppDispatch, useAppSelector } from '../../../store';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import {
    fetchActionsByRecommendationId,
    saveActionForRecommendation,
    updateActionForRecommendation,
    deleteActionForRecommendation,
    clearError,
    loadSampleActions
} from '../../modules/services/actionSlice';
import './RecommendationActionsModal.css';
import GlobalUserSearch from '../../modules/components/globalUserSearch/GlobalUserSearch';
import { PersonModel } from '../../models/global/personModel';

import { Slider } from '@mui/material';

interface RecommendationActionsModalProps {
    isOpen?: boolean;
    open?: boolean;
    onClose: () => void;
    recommendation?: any;
    recommendationId?: number;
    recommendationTitle?: string;
    onSaveAction?: (action: any) => void;
    onUpdateAction?: (actionId: number, action: any) => void;
    onDeleteAction?: (actionId: number) => void;
    useSampleData?: boolean; // New prop to force sample data
}

const RecommendationActionsModal: React.FC<RecommendationActionsModalProps> = ({
    isOpen,
    open,
    onClose,
    recommendation,
    recommendationId,
    recommendationTitle,
    onSaveAction,
    onUpdateAction,
    onDeleteAction,
    useSampleData = false
}) => {
    const dispatch = useAppDispatch();
    const [showUserPopup, setShowUserPopup] = useState(false);
    const { actions, loading, error } = useAppSelector((state) => state.actions);
    const [isEditing, setIsEditing] = useState(false);
    const [editingActionId, setEditingActionId] = useState<string | null>(null);
    const [formData, setFormData] = useState<IActionFormData>({
        title: '',
        procedureStatus: '',
        fromDate: '',
        toDate: '',
        responsibleBy: '',
        responsibleType: '',
        implementation: '',
        coordination: '',
        progress: 0
    });

    // Validation states
    const [errors, setErrors] = useState({
        title: '',
        procedureStatus: '',
        fromDate: '',
        toDate: '',
        responsibleBy: '',
        responsibleType: '',
        implementation: '',
        coordination: '',
        progress: ''
    });

    const [touched, setTouched] = useState({
        title: false,
        procedureStatus: false,
        fromDate: false,
        toDate: false,
        responsibleBy: false,
        responsibleType: false,
        implementation: false,
        coordination: false,
        progress: false
    });

    const intl = useIntl();

    // Validation function
    const validateField = (fieldName: string, value: string) => {
        let error = '';

        switch (fieldName) {
            case 'title':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.TITLE.REQUIRED' });
                }
                break;
            case 'procedureStatus':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.PROCEDURE_STATUS.REQUIRED' });
                }
                break;
            case 'fromDate':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.FROM_DATE.REQUIRED' });
                }
                break;
            case 'toDate':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.TO_DATE.REQUIRED' });
                }
                break;
            case 'implementation':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.IMPLEMENTATION.REQUIRED' });
                }
                break;
            case 'coordination':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.COORDINATION.REQUIRED' });
                }
                break;
            case 'responsibleType':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.ACTION.RESPONSIBLE_TYPE.REQUIRED' });
                }
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    // Handle field blur for validation
    const handleFieldBlur = (fieldName: string, value: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, value);
    };

    // Use either isOpen or open prop
    const modalIsOpen = isOpen ?? open ?? false;

    // Fetch actions when modal opens and recommendationId is available
    useEffect(() => {
        if (modalIsOpen && recommendationId) {
            console.log('Modal opened with recommendationId:', recommendationId, 'useSampleData:', useSampleData);

            if (useSampleData) {
                // Directly load sample data
                console.log('Loading sample data directly');
                dispatch(loadSampleActions({ recommendationId }));
            } else {
                // Try API first, will fallback to sample data automatically if API fails
                console.log('Attempting API call, will fallback to sample data if needed');
                dispatch(fetchActionsByRecommendationId({ recommendationId, useSampleData: false }));
            }
        }

        // Clear error when modal closes
        if (!modalIsOpen) {
            dispatch(clearError());
        }
    }, [modalIsOpen, recommendationId, useSampleData, dispatch]); const displayActions = actions.filter(action => action.status !== 'deleted');

    const handleInputChange = (field: keyof IActionFormData, value: string | Date | number | undefined) => {
        let processedValue: any = '';

        if (field === 'fromDate' || field === 'toDate') {
            // Handle Date objects from MUIDatePicker
            if (value instanceof Date) {
                processedValue = dayjs(value).format('YYYY-MM-DD');
            } else if (typeof value === 'string') {
                processedValue = value;
            }
        } else if (field === 'progress') {
            // Handle number values for progress
            processedValue = typeof value === 'number' ? value : 0;
        } else {
            // Handle string values
            processedValue = typeof value === 'string' ? value : '';
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            procedureStatus: '',
            fromDate: '',
            toDate: '',
            responsibleBy: '',
            responsibleType: '',
            implementation: '',
            coordination: '',
            progress: 0
        });
        setErrors({
            title: '',
            procedureStatus: '',
            fromDate: '',
            toDate: '',
            responsibleBy: '',
            responsibleType: '',
            implementation: '',
            coordination: '',
            progress: ''
        });
        setTouched({
            title: false,
            procedureStatus: false,
            fromDate: false,
            toDate: false,
            responsibleBy: false,
            responsibleType: false,
            implementation: false,
            coordination: false,
            progress: false
        });
        setIsEditing(false);
        setEditingActionId(null);
    };

    const handleSave = async () => {
        // Mark all fields as touched to show validation errors
        setTouched({
            title: true,
            procedureStatus: true,
            fromDate: true,
            toDate: true,
            responsibleBy: true,
            responsibleType: true,
            implementation: true,
            coordination: true,
            progress: true
        });

        // Validate required fields
        const validationErrors: string[] = [];

        if (!formData.title?.trim()) {
            const titleError = intl.formatMessage({ id: 'VALIDATION.ACTION.TITLE.REQUIRED' });
            validationErrors.push(titleError);
            setErrors(prev => ({ ...prev, title: titleError }));
        }

        if (!formData.procedureStatus?.trim()) {
            const statusError = intl.formatMessage({ id: 'VALIDATION.ACTION.PROCEDURE_STATUS.REQUIRED' });
            validationErrors.push(statusError);
            setErrors(prev => ({ ...prev, procedureStatus: statusError }));
        }

        if (!formData.fromDate?.trim()) {
            const fromDateError = intl.formatMessage({ id: 'VALIDATION.ACTION.FROM_DATE.REQUIRED' });
            validationErrors.push(fromDateError);
            setErrors(prev => ({ ...prev, fromDate: fromDateError }));
        }

        if (!formData.toDate?.trim()) {
            const toDateError = intl.formatMessage({ id: 'VALIDATION.ACTION.TO_DATE.REQUIRED' });
            validationErrors.push(toDateError);
            setErrors(prev => ({ ...prev, toDate: toDateError }));
        }

        if (!formData.implementation?.trim()) {
            const implementationError = intl.formatMessage({ id: 'VALIDATION.ACTION.IMPLEMENTATION.REQUIRED' });
            validationErrors.push(implementationError);
            setErrors(prev => ({ ...prev, implementation: implementationError }));
        }

        if (!formData.coordination?.trim()) {
            const coordinationError = intl.formatMessage({ id: 'VALIDATION.ACTION.COORDINATION.REQUIRED' });
            validationErrors.push(coordinationError);
            setErrors(prev => ({ ...prev, coordination: coordinationError }));
        }

        if (!formData.responsibleType?.trim()) {
            const responsibleTypeError = intl.formatMessage({ id: 'VALIDATION.ACTION.RESPONSIBLE_TYPE.REQUIRED' });
            validationErrors.push(responsibleTypeError);
            setErrors(prev => ({ ...prev, responsibleType: responsibleTypeError }));
        }

        // Optional: Validate date logic (from date should be before to date)
        if (formData.fromDate && formData.toDate) {
            const fromDate = new Date(formData.fromDate);
            const toDate = new Date(formData.toDate);
            if (fromDate > toDate) {
                validationErrors.push(intl.formatMessage({ id: 'VALIDATION.ACTION.DATE_RANGE.INVALID' }));
            }
        }

        // Display validation errors and stop if there are any
        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        if (!recommendationId) {
            alert('Recommendation ID is required');
            return;
        }

        try {
            if (isEditing && editingActionId) {
                // Update existing action
                await dispatch(updateActionForRecommendation({
                    actionId: editingActionId,
                    actionData: {
                        ...formData,
                        text: formData.title,
                        updatedAt: new Date().toISOString()
                    }
                })).unwrap();

                // Call the parent callback if provided
                if (onUpdateAction) {
                    onUpdateAction(Number(editingActionId), formData);
                }
            } else {
                // Create new action
                const actionData = {
                    text: formData.title || '',
                    title: formData.title,
                    procedureStatus: formData.procedureStatus,
                    fromDate: formData.fromDate,
                    toDate: formData.toDate,
                    responsibleBy: formData.responsibleBy,
                    responsibleType: formData.responsibleType,
                    implementation: formData.implementation,
                    coordination: formData.coordination,
                    progress: formData.progress || 0,
                    priority: 'medium' as const,
                    status: 'active' as const,
                    description: '',
                    createdAt: new Date().toISOString(),
                };

                await dispatch(saveActionForRecommendation({
                    recommendationId,
                    actionData
                })).unwrap();

                // Call the parent callback if provided
                if (onSaveAction) {
                    onSaveAction(actionData);
                }
            }

            resetForm();
        } catch (error) {
            console.error('Error saving action:', error);
            alert('Failed to save action. Please try again.');
        }
    };

    const handleEdit = (action: IRecommendationAction) => {
        setFormData({
            title: action.title,
            procedureStatus: action.procedureStatus,
            fromDate: action.fromDate,
            toDate: action.toDate,
            responsibleBy: action.responsibleBy,
            responsibleType: action.responsibleType || '',
            implementation: action.implementation,
            coordination: action.coordination,
            progress: (action as any).progress || 0
        });

        // Reset validation state when editing
        setErrors({
            title: '',
            procedureStatus: '',
            fromDate: '',
            toDate: '',
            responsibleBy: '',
            responsibleType: '',
            implementation: '',
            coordination: '',
            progress: ''
        });

        setTouched({
            title: false,
            procedureStatus: false,
            fromDate: false,
            toDate: false,
            responsibleBy: false,
            responsibleType: false,
            implementation: false,
            coordination: false,
            progress: false
        });

        setIsEditing(true);
        setEditingActionId(String(action.id));
    };

    const handleDelete = async (actionId: string) => {
        if (window.confirm(intl.formatMessage({ id: 'ACTION_MODAL.CONFIRM_DELETE' }))) {
            try {
                await dispatch(deleteActionForRecommendation({ actionId })).unwrap();

                // Call the parent callback if provided
                if (onDeleteAction) {
                    onDeleteAction(Number(actionId));
                }
            } catch (error) {
                console.error('Error deleting action:', error);
                alert('Failed to delete action. Please try again.');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'in-progress': return '#f59e0b';
            case 'pending': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return intl.formatMessage({ id: 'ACTION_MODAL.STATUS.COMPLETED' });
            case 'in-progress': return intl.formatMessage({ id: 'ACTION_MODAL.STATUS.IN_PROGRESS' });
            case 'pending': return intl.formatMessage({ id: 'ACTION_MODAL.STATUS.PENDING' });
            default: return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return intl.formatMessage({ id: 'ACTION_MODAL.PRIORITY.HIGH' });
            case 'medium': return intl.formatMessage({ id: 'ACTION_MODAL.PRIORITY.MEDIUM' });
            case 'low': return intl.formatMessage({ id: 'ACTION_MODAL.PRIORITY.LOW' });
            default: return priority;
        }
    };

    // Event Listener
    const handleOnAdd = (pModel: PersonModel[]) => {
        let userList: PersonModel[];
        // if (personModel && personModel.length > 0) {
        //     // Check for duplicates and filter out
        //     const filteredModel = pModel.filter(newPerson =>
        //         !personModel.some(person => person.personId === newPerson.personId)
        //     );
        //     userList = [...personModel, ...filteredModel];
        // } else {
        //     userList = [...personModel, ...pModel];
        // }
        // setPersonModel(userList);
        // userList.map((obj) => {
        //     //const currentuserObj = { "userId": obj.personId, "unitId": auth?.unitId!, "userName": obj.userName, "displayName": (lang == "ar" ? obj.name.ar : obj.name.en), "type": "User" }
        //     const currentuserObj = { "value": obj.personId, "label": (lang == "ar" ? obj.name.ar : obj.name.en), "typeId": 1 }
        //     if (attendees.find((item) => item.value === obj.personId) == undefined)
        //         attendees.push(currentuserObj);

        // });
        setShowUserPopup(false);

    };

    return (<>
        <Modal
            show={modalIsOpen}
            onHide={onClose}
            size="xl"
            className="recommendation-actions-modal"
            style={{ '--bs-modal-width': '1400px' } as any}
        >
            <Modal.Header closeButton className="pb-0">
                <Modal.Title>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        {intl.formatMessage({ id: 'ACTION_MODAL.TITLE' })}
                    </Typography>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-0">
                <Box className="modal-body">
                    <div className="container-fluid h-100 p-0 w-100">


                        {/* Header Section */}
                        <Box sx={{

                            padding: '16px 0px',
                            direction: 'rtl'
                        }}>

                            <div className="row align-items-center">
                                {/* Title Search */}
                                <div className="col-md-3">

                                    <input
                                        type="text"
                                        className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                        placeholder={intl.formatMessage({ id: 'ACTION_MODAL.HEADER.TITLE' })}
                                        onChange={(e) => {
                                            // Handle title search
                                        }}
                                        dir="rtl"
                                        style={{ fontSize: '14px' }}
                                    />
                                </div>


                                {/* Date Filter */}
                                <div className="col-md-2">

                                    <MUIDatePicker
                                        placeholder={intl.formatMessage({ id: 'ACTION_MODAL.HEADER.DATE' })}
                                        value={undefined}
                                        onDateChange={(newDate: Date | undefined) => {
                                            // Handle date filter
                                        }}
                                        key={generateUUID()}
                                        id="headerDateFilter"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="col-md-2">

                                    <DropdownListInModal
                                        data={[
                                            { id: '', name: 'الكل' },
                                            { id: 'pending', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.PENDING' }) },
                                            { id: 'in-progress', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.IN_PROGRESS' }) },
                                            { id: 'completed', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.COMPLETED' }) }
                                        ]}
                                        dataKey="id"
                                        dataValue="name"
                                        value=""
                                        defaultText={intl.formatMessage({ id: 'ACTION_MODAL.HEADER.STATUS' })}
                                        setSelectedValue={(value: string) => {
                                            // Handle status filter
                                        }}

                                        isClearable={true}
                                    />
                                </div>


                                {/* Action Buttons */}
                                <div className="col-md-4 d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            if (recommendationId) {
                                                dispatch(loadSampleActions({ recommendationId }));
                                            }
                                        }}
                                        sx={{
                                            borderColor: '#6b7280',
                                            color: '#6b7280',
                                            fontWeight: 600,
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            minWidth: 'auto',
                                            whiteSpace: 'nowrap',
                                            '&:hover': {
                                                borderColor: '#4b5563',
                                                backgroundColor: '#f9fafb'
                                            },
                                            direction: 'rtl'
                                        }}
                                    >
                                        Sample Data
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => resetForm()}
                                        sx={{
                                            backgroundColor: '#c4945c',
                                            color: 'white',
                                            fontWeight: 600,
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            minWidth: 'auto',
                                            whiteSpace: 'nowrap',
                                            '&:hover': {
                                                backgroundColor: '#b8834d'
                                            },
                                            direction: 'rtl'
                                        }}
                                    >
                                        {intl.formatMessage({ id: 'ACTION_MODAL.HEADER.ADD_ACTION' })}
                                    </Button>
                                </div>
                            </div>
                        </Box>

                        <Card sx={{
                            height: '100%'
                        }}>
                            <CardContent sx={{
                                padding: '0 !important',
                                height: '100%',
                                '&:last-child': {
                                    paddingBottom: '0 !important'
                                }
                            }}>
                                <div className="row h-100 m-0">
                                    {/* Error Display */}
                                    {error && (
                                        <div className="col-12 p-2">
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    {/* Left Panel - Add/Edit Action Form */}
                                    <div className="col-md-4 right-panel p-0">
                                        <Box className="actions-panel" sx={{ height: '800px', display: 'flex', flexDirection: 'column', padding: '0px' }}>

                                            <Box
                                                className="actions-list"
                                                sx={{
                                                    flex: 1,
                                                    maxHeight: '750px',
                                                    overflowY: 'auto',
                                                    '&::-webkit-scrollbar': {
                                                        width: '6px',
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        backgroundColor: '#f1f5f9',

                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        backgroundColor: '#cbd5e1',

                                                        '&:hover': {
                                                            backgroundColor: '#94a3b8',
                                                        },
                                                    },
                                                }}
                                            >
                                                {loading ? (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        height: '200px',
                                                        color: '#6b7280'
                                                    }}>
                                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                                            Loading actions...
                                                        </Typography>
                                                    </Box>
                                                ) : displayActions.length === 0 ? (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        height: '200px',
                                                        color: '#6b7280'
                                                    }}>
                                                        <AddIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                                            {intl.formatMessage({ id: 'ACTION_MODAL.EMPTY_STATE.NO_ACTIONS' })}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {intl.formatMessage({ id: 'ACTION_MODAL.EMPTY_STATE.ADD_ACTION' })}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    displayActions.map((action) => (
                                                        <Card
                                                            key={action.id}
                                                            sx={{

                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '0px',

                                                                direction: 'rtl'
                                                            }}
                                                        >
                                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1f2937', flex: 1 }}>
                                                                        {action.title}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleEdit(action)}
                                                                            disabled={loading}
                                                                            sx={{
                                                                                color: '#3b82f6',
                                                                                '&:hover': { backgroundColor: '#dbeafe' }
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleDelete(String(action.id))}
                                                                            disabled={loading}
                                                                            sx={{
                                                                                color: '#ef4444',
                                                                                '&:hover': { backgroundColor: '#fee2e2' }
                                                                            }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>

                                                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                                    <Chip
                                                                        label={getStatusLabel(action.procedureStatus || '')}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: getStatusColor(action.procedureStatus || ''),
                                                                            color: 'white',
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        label={getPriorityLabel(action.priority || '')}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            borderColor: getPriorityColor(action.priority || ''),
                                                                            color: getPriorityColor(action.priority || ''),
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.875rem', color: '#6b7280' }}>
                                                                    {action.responsibleBy && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <PersonIcon sx={{ fontSize: 16 }} />
                                                                            <Typography variant="body2">
                                                                                {intl.formatMessage({ id: 'ACTION_MODAL.LABELS.RESPONSIBLE' })} {action.responsibleBy}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {action.fromDate && action.toDate && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <CalendarIcon sx={{ fontSize: 16 }} />
                                                                            <Typography variant="body2">
                                                                                {dayjs(action.fromDate).format('DD/MM/YYYY')} - {dayjs(action.toDate).format('DD/MM/YYYY')}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {action.implementation && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                {intl.formatMessage({ id: 'ACTION_MODAL.LABELS.IMPLEMENTATION' })}
                                                                            </Typography>
                                                                            <Typography variant="body2">
                                                                                {action.implementation}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {action.coordination && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                {intl.formatMessage({ id: 'ACTION_MODAL.LABELS.COORDINATION' })}
                                                                            </Typography>
                                                                            <Typography variant="body2">
                                                                                {action.coordination}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                )}
                                            </Box>
                                        </Box>
                                    </div>

                                    {/* Right Panel - Actions List */}
                                    <div className="col-md-8 left-panel p-0">
                                        <Box className="form-panel" sx={{ height: '800px', display: 'flex', flexDirection: 'column', width: '100%' }}>


                                            <Box className="form-content p-0" sx={{ flex: 1, width: '100%' }}>
                                                {/* Title Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.TITLE' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <input
                                                                type="text"
                                                                autoComplete="off"
                                                                className={`form-control form-control-solid active input5 lbl-txt-medium-2`}
                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.TITLE' })}
                                                                value={formData.title}
                                                                onChange={(e) => {
                                                                    handleInputChange('title', e.target.value);
                                                                    if (touched.title) {
                                                                        validateField('title', e.target.value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => handleFieldBlur('title', e.target.value)}
                                                                dir="rtl"
                                                            />
                                                            {touched.title && errors.title && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.title}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Procedure Status Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.PROCEDURE_STATUS' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <DropdownListInModal
                                                                data={[
                                                                    { id: 'pending', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.PENDING' }) },
                                                                    { id: 'in-progress', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.IN_PROGRESS' }) },
                                                                    { id: 'completed', name: intl.formatMessage({ id: 'ACTION_MODAL.STATUS.COMPLETED' }) }
                                                                ]}
                                                                dataKey="id"
                                                                dataValue="name"
                                                                value={formData.procedureStatus}
                                                                defaultText={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.PROCEDURE_STATUS' })}
                                                                setSelectedValue={(value: string) => {
                                                                    handleInputChange('procedureStatus', value);
                                                                    setTouched(prev => ({ ...prev, procedureStatus: true }));
                                                                    validateField('procedureStatus', value || '');
                                                                }}
                                                                width={300}
                                                                isClearable={true}
                                                            />
                                                            {touched.procedureStatus && errors.procedureStatus && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.procedureStatus}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date Fields */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.FROM_DATE' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <MUIDatePicker

                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.FROM_DATE' })}
                                                                value={formData.fromDate ? new Date(formData.fromDate) : undefined}
                                                                onDateChange={(newDate: Date | undefined) => {
                                                                    handleInputChange('fromDate', newDate);
                                                                    setTouched(prev => ({ ...prev, fromDate: true }));
                                                                    const dateValue = newDate ? dayjs(newDate).format('YYYY-MM-DD') : '';
                                                                    validateField('fromDate', dateValue);
                                                                }}
                                                                key={generateUUID()}
                                                                id="fromDate"

                                                            />
                                                            {touched.fromDate && errors.fromDate && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',

                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.fromDate}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.TO_DATE' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <MUIDatePicker
                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.TO_DATE' })}
                                                                value={formData.toDate ? new Date(formData.toDate) : undefined}
                                                                onDateChange={(newDate: Date | undefined) => {
                                                                    handleInputChange('toDate', newDate);
                                                                    setTouched(prev => ({ ...prev, toDate: true }));
                                                                    const dateValue = newDate ? dayjs(newDate).format('YYYY-MM-DD') : '';
                                                                    validateField('toDate', dateValue);
                                                                }}
                                                                minDate={formData.fromDate ? new Date(formData.fromDate) : undefined}
                                                                key={generateUUID()}
                                                                id="toDate"
                                                            />
                                                            {touched.toDate && errors.toDate && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.toDate}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Responsible Type Radio Buttons */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.RESPONSIBLE_TYPE' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <div className="d-flex gap-4 align-items-center" dir="rtl">
                                                                <label className="d-flex align-items-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="responsibleType"
                                                                        value="individuals"
                                                                        checked={formData.responsibleType === 'individuals'}
                                                                        onChange={(e) => {
                                                                            handleInputChange('responsibleType', e.target.value);
                                                                            setTouched(prev => ({ ...prev, responsibleType: true }));
                                                                            validateField('responsibleType', e.target.value);
                                                                        }}
                                                                        className="form-check-input me-2"
                                                                    />
                                                                    <span className="ms-2">
                                                                        {intl.formatMessage({ id: 'ACTION_MODAL.RESPONSIBLE_TYPE.INDIVIDUALS' })}
                                                                    </span>
                                                                </label>
                                                                <label className="d-flex align-items-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="responsibleType"
                                                                        value="units"
                                                                        checked={formData.responsibleType === 'units'}
                                                                        onChange={(e) => {
                                                                            handleInputChange('responsibleType', e.target.value);
                                                                            setTouched(prev => ({ ...prev, responsibleType: true }));
                                                                            validateField('responsibleType', e.target.value);
                                                                        }}
                                                                        className="form-check-input me-2"
                                                                    />
                                                                    <span className="ms-2">
                                                                        {intl.formatMessage({ id: 'ACTION_MODAL.RESPONSIBLE_TYPE.UNITS' })}
                                                                    </span>
                                                                </label>

                                                                {/* User/Unit Selection Button - Only show when type is selected */}
                                                                {formData.responsibleType && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm p-0 ms-2"
                                                                        onClick={() => { setShowUserPopup(true); }}
                                                                        title={formData.responsibleType === 'individuals' ? 'Select Individuals' : 'Select Units'}
                                                                    >
                                                                        {formData.responsibleType === 'individuals' ? (
                                                                            <PersonAddAltOutlinedIcon style={{ color: '#6b7280' }} />
                                                                        ) : (
                                                                            <svg
                                                                                width="24"
                                                                                height="24"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                style={{ color: '#6b7280' }}
                                                                            >
                                                                                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                                                                                <path d="M19 15L20 18L23 19L20 20L19 23L18 20L15 19L18 18L19 15Z" fill="currentColor" />
                                                                                <path d="M6 15L7 18L10 19L7 20L6 23L5 20L2 19L5 18L6 15Z" fill="currentColor" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {touched.responsibleType && errors.responsibleType && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.responsibleType}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Responsible By Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.RESPONSIBLE_BY' })}
                                                                isRequired={false}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <input
                                                                type="text"
                                                                autoComplete="off"
                                                                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.RESPONSIBLE_BY' })}
                                                                value={formData.responsibleBy}
                                                                onChange={(e) => handleInputChange('responsibleBy', e.target.value)}
                                                                dir="rtl"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Implementation Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.IMPLEMENTATION' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <textarea
                                                                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.IMPLEMENTATION' })}
                                                                value={formData.implementation}
                                                                onChange={(e) => {
                                                                    handleInputChange('implementation', e.target.value);
                                                                    if (touched.implementation) {
                                                                        validateField('implementation', e.target.value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => handleFieldBlur('implementation', e.target.value)}
                                                                rows={3}
                                                                dir="rtl"
                                                            />
                                                            {touched.implementation && errors.implementation && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.implementation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Coordination Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.COORDINATION' })}
                                                                isRequired={true}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <textarea
                                                                className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                                                placeholder={intl.formatMessage({ id: 'ACTION_MODAL.PLACEHOLDERS.COORDINATION' })}
                                                                value={formData.coordination}
                                                                onChange={(e) => {
                                                                    handleInputChange('coordination', e.target.value);
                                                                    if (touched.coordination) {
                                                                        validateField('coordination', e.target.value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => handleFieldBlur('coordination', e.target.value)}
                                                                rows={3}
                                                                dir="rtl"
                                                            />
                                                            {touched.coordination && errors.coordination && (
                                                                <div className="invalid-feedback d-block" style={{
                                                                    color: '#dc3545',
                                                                    fontSize: '0.875rem',
                                                                    marginTop: '0.25rem',
                                                                    fontWeight: '400'
                                                                }}>
                                                                    {errors.coordination}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Field */}
                                                <div className="col-12 mb-4">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            <InfoLabels
                                                                style={{}}
                                                                text={intl.formatMessage({ id: 'ACTION_MODAL.FIELDS.PROGRESS', defaultMessage: 'Progress' })}
                                                                isRequired={false}
                                                            />
                                                        </div>
                                                        <div className="col-md-10">
                                                            <Slider
                                                                value={formData.progress || 0}
                                                                onChange={(event, newValue) => {
                                                                    handleInputChange('progress', newValue as number);
                                                                }}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                valueLabelDisplay="auto"
                                                                aria-label="Progress percentage"
                                                                sx={{
                                                                    color: '#c4945c',
                                                                    '& .MuiSlider-thumb': {
                                                                        backgroundColor: '#c4945c',
                                                                    },
                                                                    '& .MuiSlider-track': {
                                                                        backgroundColor: '#c4945c',
                                                                    },
                                                                    '& .MuiSlider-rail': {
                                                                        backgroundColor: '#e5e7eb',
                                                                    },
                                                                    '& .MuiSlider-valueLabel': {
                                                                        backgroundColor: '#c4945c',
                                                                        color: '#ffffff',
                                                                        '&:before': {
                                                                            borderTopColor: '#c4945c',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <div className="mt-2 text-center">
                                                                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                                    {formData.progress || 0}% {intl.formatMessage({ id: 'ACTION_MODAL.LABELS.COMPLETE', defaultMessage: 'Complete' })}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className='d-flex justify-content-end'>


                                                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>

                                                        <button
                                                            type="button"
                                                            className="btn MOD_btn btn-create w-40 pl-5"
                                                            onClick={handleSave}
                                                            disabled={loading}
                                                        >
                                                            <BtnLabeltxtMedium2
                                                                customClassName="MOD_btn2_Label"
                                                                isI18nKey={true}
                                                                text={loading ? 'Saving...' : (isEditing ? intl.formatMessage({ id: 'ACTION_MODAL.BUTTONS.UPDATE' }) : intl.formatMessage({ id: 'ACTION_MODAL.BUTTONS.SAVE' }))}
                                                            />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"

                                                            onClick={resetForm}
                                                        >
                                                            <BtnLabeltxtMedium2
                                                                customClassName="MOD_btn2_Label"
                                                                isI18nKey={true}
                                                                text={isEditing ? intl.formatMessage({ id: 'ACTION_MODAL.BUTTONS.CANCEL' }) : intl.formatMessage({ id: 'ACTION_MODAL.BUTTONS.CLEAR' })}
                                                            />
                                                        </button>

                                                    </Box>
                                                </div>
                                            </Box>
                                        </Box>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Box>
            </Modal.Body>
        </Modal>

        {/* Global Search Users */}
        <Modal
            className='modal-sticky modal-sticky-lg modal-sticky-bottom-right'
            size="lg"
            backdrop="static"
            show={showUserPopup}
            onHide={() => setShowUserPopup(false)}

            backdropClassName="modal-backdrop-custom">
            <Modal.Header closeButton>
                <Modal.Title>
                    <HeaderLabels text={"MOD.GLOBAL.MODAL.TITLE.SEARCHUSER"} />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <GlobalUserSearch onUsersAdd={handleOnAdd} />
            </Modal.Body>
        </Modal>
    </>

    );
};

export default RecommendationActionsModal;