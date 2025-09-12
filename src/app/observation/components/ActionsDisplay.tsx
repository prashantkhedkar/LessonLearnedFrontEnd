import React, { useState, useEffect } from 'react'
import {
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    Divider
} from '@mui/material'
import { Modal, Row, Col } from "react-bootstrap"
import { GlobalLabel } from "../../modules/components/common/label/LabelCategory"
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import { useLang } from "../../../_metronic/i18n/Metronici18n"
import { BtnLabelCanceltxtMedium2, HeaderLabels, LabelTextSemibold2 } from '../../modules/components/common/formsLabels/detailLabels'
import DropdownList from "../../modules/components/dropdown/DropdownList"
import './ActionsDisplay.css'
import { generateUUID, writeToBrowserConsole } from '../../modules/utils/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AccessTimeSharpIcon from '@mui/icons-material/AccessTimeSharp';
import { useAppDispatch } from '../../../store'
import { fetchActionsByRecommendationId, saveActionForRecommendation } from '../../modules/services/globalSlice'
import { unwrapResult } from '@reduxjs/toolkit'

interface Action {
    id: number
    text: string
    timestamp?: string
    status?: 'completed' | 'pending' | 'cancelled'
}

interface ActionsDisplayProps {
    recommendationId?: number | string
}

const ActionsDisplay: React.FC<ActionsDisplayProps> = ({
    recommendationId
}) => {
    const lang = useLang()
    const dispatch = useAppDispatch()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedReason, setSelectedReason] = useState('')
    const [editingActionId, setEditingActionId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Status options for dropdown
    const statusOptions = [
        { lookupId: '1', lookupNameAr: 'تم التنفيذ', lookupName: 'Executed' },
        { lookupId: '2', lookupNameAr: 'قيد التنفيذ', lookupName: 'Pending' },
        { lookupId: '3', lookupNameAr: 'ملغي', lookupName: 'Cancelled' }
    ]

    const [actionsList, setActionsList] = useState<Action[]>([])

    // Fetch actions based on recommendationId when component mounts or recommendationId changes
    useEffect(() => {
        if (recommendationId) {
            fetchActionsFromAPI()
        } else {
            // Default sample data if no recommendationId provided
            setActionsList([
                {
                    id: 1,
                    text: "إن المؤسسة العسكرية التي ساهم في بنائها صاحب السمو الشيخ محمد بن زايد آل نهيان رئيس الدولة القائد الأعلى للقوات المسلحة حفظه الله وساندها أخيه صاحب السمو الشيخ محمد بن راشد آل مكتوم نائب",
                    timestamp: "2025/02/20",
                    status: "completed"
                }
            ])
        }
    }, [recommendationId])

    const fetchActionsFromAPI = async () => {
        if (!recommendationId) return

        setLoading(true)
        setError(null)

        try {
            const result = await dispatch(fetchActionsByRecommendationId({ 
                recommendationId 
            }))
            const response = unwrapResult(result)
            
            if (response.statusCode === 200) {
                const fetchedActions = response.data as Action[]
                setActionsList(fetchedActions || [])
            } else {
                setError('Failed to fetch actions')
                console.error('API returned non-200 status:', response.statusCode)
            }
        } catch (error) {
            setError('Error fetching actions')
            console.error('Error fetching actions:', error)
            writeToBrowserConsole(`Error fetching actions for recommendation ${recommendationId}: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const handleAddAction = () => {
        setEditingActionId(null) // null means we're adding, not editing
        setSelectedStatus('')
        setSelectedReason('')
        setIsEditModalOpen(true)
    }

    const handleEditAction = (actionId: number) => {
        setEditingActionId(actionId)
        // Load existing action data if needed
        const action = actionsList.find(a => a.id === actionId)
        if (action) {
            setSelectedStatus(action.status || '')
            setSelectedReason('') // Load existing reason if you have it
        }
        setIsEditModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsEditModalOpen(false)
        setSelectedStatus('')
        setSelectedReason('')
        setEditingActionId(null)
    }

    const handleSave = async () => {
        if (editingActionId === null) {
            // Adding new action
            const newAction: Action = {
                id: actionsList.length + 1,
                text: selectedReason || "إجراء جديد...",
                timestamp: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                status: selectedStatus as 'completed' | 'pending' | 'cancelled' || 'pending'
            }

            // Save to API if recommendationId is provided
            if (recommendationId) {
                try {
                    const result = await dispatch(saveActionForRecommendation({
                        recommendationId,
                        actionData: {
                            text: newAction.text,
                            status: newAction.status || 'pending',
                            timestamp: newAction.timestamp
                        }
                    }))
                    const response = unwrapResult(result)
                    
                    if (response.statusCode === 200) {
                        // Update local state with response data if available, or use new action
                        const savedAction = response.data || newAction
                        setActionsList([...actionsList, savedAction])
                    } else {
                        console.error('Failed to save action:', response.message)
                        // Fallback to local state update
                        setActionsList([...actionsList, newAction])
                    }
                } catch (error) {
                    console.error('Error saving action:', error)
                    writeToBrowserConsole(`Error saving action for recommendation ${recommendationId}: ${error}`)
                    // Fallback to local state update
                    setActionsList([...actionsList, newAction])
                }
            } else {
                // Update local state only
                setActionsList([...actionsList, newAction])
            }
        } else {
            // Editing existing action
            const updatedAction = actionsList.find(action => action.id === editingActionId)
            if (updatedAction && recommendationId) {
                try {
                    const result = await dispatch(saveActionForRecommendation({
                        recommendationId,
                        actionData: {
                            id: editingActionId,
                            text: updatedAction.text,
                            status: selectedStatus as 'completed' | 'pending' | 'cancelled' || updatedAction.status || 'pending'
                        }
                    }))
                    const response = unwrapResult(result)
                    
                    if (response.statusCode === 200) {
                        // Update local state
                        setActionsList(actionsList.map(action => 
                            action.id === editingActionId 
                                ? { ...action, status: selectedStatus as 'completed' | 'pending' | 'cancelled' || action.status }
                                : action
                        ))
                    } else {
                        console.error('Failed to update action:', response.message)
                    }
                } catch (error) {
                    console.error('Error updating action:', error)
                    writeToBrowserConsole(`Error updating action for recommendation ${recommendationId}: ${error}`)
                }
            } else {
                // Update local state only
                setActionsList(actionsList.map(action => 
                    action.id === editingActionId 
                        ? { ...action, status: selectedStatus as 'completed' | 'pending' | 'cancelled' || action.status }
                        : action
                ))
            }
        }
        handleCloseModal()
    }

    const handleDeleteAction = (actionId: number) => {
        setActionsList(actionsList.filter(action => action.id !== actionId))
    }

    const getStatusIcon = (status: string) => {
        const iconClass = `status-icon ${status || 'default'}`
        switch (status) {
            case 'completed':
                return <CheckCircleOutlineIcon className={iconClass} />
            case 'pending':
                return <AccessTimeIcon className={iconClass} />
            case 'cancelled':
                return <CancelOutlinedIcon className={iconClass} />
            default:
                return <AccessTimeIcon className={iconClass} />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'تم التنفيذ'
            case 'pending':
                return 'قيد التنفيذ'
            case 'cancelled':
                return 'ملغي'
            default:
                return 'غير محدد'
        }
    }

    return (
        <>
        <Box className="actions-display-container">
            {/* Loading State */}
            {loading && (
                <Box className="loading-state" sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1">جاري تحميل الإجراءات...</Typography>
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Box className="error-state" sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                    <Button 
                        onClick={fetchActionsFromAPI} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 1 }}
                    >
                        إعادة المحاولة
                    </Button>
                </Box>
            )}

            {/* Actions List */}
            {!loading && !error && (
                <Box className="actions-list">
                    {actionsList.map((action, index) => (
                    <Card
                        key={action.id}
                        className="action-card"
                    >
                        <CardContent className="action-card-content">
                            {/* Action Header */}
                            <Box className="action-header">

                                <LabelTextSemibold2
                                    text={`الإجراء ${index + 1}`}
                                />
                                {/* Action Icons and Status */}
                                <Box className="action-controls">
                                    {/* Status Badge */}
                                    <Box className={`status-badge ${action.status || 'default'}`}>
                                        {getStatusIcon(action.status || 'pending')}
                                        <Typography
                                            variant="caption"
                                            className={`status-text ${action.status || 'default'}`}
                                        >
                                            {getStatusText(action.status || 'pending')}
                                        </Typography>
                                    </Box>

                                    {/* Action Icons */}
                                    <Box className="action-icons">
                                        <IconButton
                                            onClick={() => console.log('View action:', action.id)}
                                            size="small"
                                            className="action-icon-button"
                                        >
                                            <VisibilityOutlinedIcon className="action-icon" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEditAction(action.id)}
                                            size="small"
                                            className="action-icon-button edit"
                                        >
                                            <EditOutlinedIcon className="action-icon" />
                                        </IconButton>
                                        {/* <IconButton
                                            onClick={() => handleDeleteAction(action.id)}
                                            size="small"
                                            className="action-icon-button delete"
                                        >
                                            <DeleteOutlineIcon className="action-icon" />
                                        </IconButton> */}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Action Content */}
                            <Box className="action-content">
                                <Typography
                                    variant="body1"
                                    className="action-text"
                                >
                                    {action.text}
                                </Typography>

                                {/* Action Footer */}
                                <Box className="action-footer">
                                    {/* Left side - By */}
                                    <Box className="action-footer-item">
                                        <PersonIcon className="action-footer-icon" />
                                        <Typography variant="caption" className="action-footer-label">
                                            بواسطة :
                                        </Typography>
                                        <Typography variant="caption" className="action-footer-value">
                                            القوات البرية
                                        </Typography>
                                         <Box className="action-footer-center">
                                        <IconButton
                                            onClick={() => handleEditAction(action.id)}
                                            size="small"
                                            className="action-footer-edit-button"
                                        >
                                            <EditIcon className="action-footer-edit-icon" />
                                        </IconButton>
                                    </Box>

                                    </Box>

                                    {/* Center - Edit Icon */}
                                   
                                    {/* Right side - Date */}
                                    {action.timestamp && (
                                        <Box className="action-footer-item">
                                          
                                            <Typography variant="caption" className="action-footer-label">
                                                تاريخ الإجراء :
                                            </Typography>
                                              <CalendarTodayIcon className="action-footer-icon" />
                                            <Typography variant="caption" className="action-footer-value">
                                                {action.timestamp}
                                            </Typography>
                                             <AccessTimeSharpIcon className="action-footer-icon" />
                                            <Typography variant="caption" className="action-footer-value">
                                                {action.timestamp}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
                </Box>
            )}

            {/* Add Action Button - Show after all actions or in empty state */}
            {!loading && !error && actionsList.length > 0 && (
                <Box className="add-action-container">
                     
                    <button
                      onClick={handleAddAction}
                      className="btn MOD_btn btn-add min-w-75px w-100 align-self-end px-6"
                      id={generateUUID()}
                     
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        size="lg"
                      ></FontAwesomeIcon>
                      <BtnLabelCanceltxtMedium2
                        text={"إضافة إجراء"}
                      />
                    </button>
                </Box>
            )}

            {/* Empty State */}
            {!loading && !error && actionsList.length === 0 && (
                <Box className="empty-state">
                    <Typography variant="body1" className="empty-state-text">
                        لا توجد إجراءات متاحة
                    </Typography>
                    <Button
                        onClick={handleAddAction}
                        variant="outlined"
                        startIcon={<AddIcon />}
                        className="empty-state-button"
                    >
                        إضافة أول إجراء
                    </Button>
                </Box>
            )}
        </Box>

        {/* Edit/Add Modal */}
        <Modal
            className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
            animation={false}
            enforceFocus={false}
            dialogClassName="modal-dialog-scrollable"
            aria-labelledby="contained-modal-title-vcenter"
            show={isEditModalOpen}
            onHide={handleCloseModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <HeaderLabels
                        text={editingActionId === null ? "إضافة إجراء جديد" : "تعديل حالة الاجراء"}
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Status Dropdown */}
                <Row className="mb-4 px-4">
                    <Col className={"col-2"}>
                        <GlobalLabel value="الحالة" />
                    </Col>
                    <Col className={"col-10 align-self-center"}>
                        <DropdownList
                            dataKey="lookupId"
                            dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                            defaultText={lang === "ar" ? "اختر" : "Select"}
                            value={selectedStatus}
                            data={statusOptions}
                            setSelectedValue={(value) => {
                                console.log('Setting selected value:', value);
                                setSelectedStatus(value);
                            }}
                        />
                    </Col>
                </Row>

                {/* Reasons Multiline Textbox */}
                <Row className="mb-4 px-4">
                    <Col className={"col-2"}>
                        <GlobalLabel value={editingActionId === null ? "وصف الإجراء" : "الاسباب"} />
                    </Col>
                    <Col className={"col-10 align-self-center"}>
                        <textarea
                            rows={4}
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            placeholder={editingActionId === null ? "أدخل وصف الإجراء" : "ادخل الأسباب"}
                            className="modal-textarea"
                        />
                    </Col>
                </Row>

                {/* Action Buttons */}
                <div className="d-flex justify-content-start gap-3 mt-4 px-4">
                    <Button 
                        onClick={handleSave}
                        variant="contained" 
                        className="modal-save-button"
                    >
                        {editingActionId === null ? "إضافة" : "حفظ"}
                    </Button>
                    <Button 
                        onClick={handleCloseModal}
                        variant="outlined" 
                        className="modal-cancel-button"
                    >
                        الغاء
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default ActionsDisplay
