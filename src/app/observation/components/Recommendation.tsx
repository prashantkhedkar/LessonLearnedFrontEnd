import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Col, Modal, Row } from "react-bootstrap";
import RecommendationDetails from './RecommendationDetails';
import { generateUUID, writeToBrowserConsole } from '../../modules/utils/common';
import { IRecommendation, Recommendation as RecommendationModel } from '../../models/recommendation/recommendation.model';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, HeaderLabels, InfoLabels } from '../../modules/components/common/formsLabels/detailLabels';
import { useIntl } from 'react-intl';
import DropdownList from '../../modules/components/dropdown/DropdownList';
import { ILookup } from '../../models/global/globalGeneric';
import { GetLookupValues } from '../../modules/services/adminSlice';
import {
    fetchRecommendationsByObservationId,
    saveRecommendationForObservation,
    updateRecommendationForObservation,
    deleteRecommendationForObservation,
    clearError
} from '../../modules/services/recommendationSlice';
import { useAppDispatch, useAppSelector } from '../../../store';
import { unwrapResult } from '@reduxjs/toolkit';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import DropdownListInModal from '../../modules/components/dropdown/DropdownListInModal';
import ConfirmDeleteModal from '../../modules/components/confirmDialog/ConfirmDeleteModal';
interface RecommendationProps {
    observationId: string | number;
}

// Using the new comprehensive recommendation model
// The old RecommendationItem interface is replaced by IRecommendation from models

const Recommendation: React.FC<RecommendationProps> = ({ observationId }) => {
    // Print the created observationId
    console.log('🎯 Step 2 Recommendation component - Received observationId:', observationId);

    const [open, setOpen] = useState(false);
    const [observationTitle, setObservationTitle] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [recommendationText, setRecommendationText] = useState('');
    const [discussion, setDiscussion] = useState('');
    const [combatFunction, setCombatFunction] = useState<number>(0);
    const [level, setLevel] = useState<number>(0);
    const [combotFunctionOptions, setCombotFunctionOptions] = useState<ILookup[]>([]);
    const [levelOptions, setLevelOptions] = useState<ILookup[]>([]);
    const [editingRecommendation, setEditingRecommendation] = useState<IRecommendation | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentConfirmFunction, setCurrentConfirmFunction] = useState<(() => Promise<void>) | null>(null);

    // Get state from Redux store
    const { recommendations, loading, error } = useAppSelector((state) => state.recommendations);

    // Validation states
    const [errors, setErrors] = useState({
        observationTitle: '',
        conclusion: '',
        recommendation: '',
        discussion: '',
        combatFunction: '',
        level: ''
    });
    const [touched, setTouched] = useState({
        observationTitle: false,
        conclusion: false,
        recommendation: false,
        discussion: false,
        combatFunction: false,
        level: false
    });

    const intl = useIntl();
    const lang = useLang();
    const dispatch = useAppDispatch();

    // Debug logging
    console.log('Recommendation component rendered with recommendations:', recommendations.length, recommendations);
    console.log('Dropdown options - Combat Function:', combotFunctionOptions.length, 'Level:', levelOptions.length);
    console.log('Current values - combatFunction:', combatFunction, 'level:', level);
    console.log('🗑️ Debug Modal State - showDeleteModal:', showDeleteModal);

    // Fetch recommendations from API when component mounts or observationId changes
    useEffect(() => {
        if (observationId) {
            fetchRecommendationsFromAPI();
        }
    }, [observationId]);

    // Debug useEffect to track showDeleteModal changes
    useEffect(() => {
        console.log('🗑️ showDeleteModal changed to:', showDeleteModal);
    }, [showDeleteModal]);

    const fetchRecommendationsFromAPI = async () => {
        debugger
        if (!observationId) return;

        dispatch(clearError());

        try {
            await dispatch(fetchRecommendationsByObservationId({
                observationId
            })).unwrap();
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            writeToBrowserConsole(`Error fetching recommendations for observation ${observationId}: ${error}`);
        }
    };

    const handleOpen = () => {
        setIsEditMode(false);
        setEditingRecommendation(null);
        setOpen(true);
    };

    const handleEditRecommendation = (recommendationId: number) => {
        debugger
        console.log('Edit clicked for recommendation ID:', recommendationId);
        const recommendation = recommendations.find(rec => rec.recommendationId === recommendationId);
        if (recommendation) {
            console.log('Found recommendation:', recommendation);
            setIsEditMode(true);
            setEditingRecommendation(recommendation);
            setObservationTitle(recommendation.observationTitle);
            setConclusion(recommendation.conclusion);
            setRecommendationText(recommendation.recommendationText);
            setDiscussion(recommendation.discussion);
            setCombatFunction(recommendation.combatFunction);
            setLevel(recommendation.level);
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
        setEditingRecommendation(null);
        setObservationTitle('');
        setConclusion('');
        setRecommendationText('');
        setDiscussion('');
        setCombatFunction(0);
        setLevel(0);
        setErrors({
            observationTitle: '',
            conclusion: '',
            recommendation: '',
            discussion: '',
            combatFunction: '',
            level: ''
        });
        setTouched({
            observationTitle: false,
            conclusion: false,
            recommendation: false,
            discussion: false,
            combatFunction: false,
            level: false
        });
    };

    // Validation functions
    const validateField = (fieldName: string, value: string | number) => {
        let error = '';

        switch (fieldName) {
            case 'observationTitle':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = intl.formatMessage({ id: 'VALIDATION.TITLE.REQUIRED' });
                } else if (typeof value === 'string' && value.length > 256) {
                    error = intl.formatMessage({ id: 'VALIDATION.TITLE.MAX_LENGTH' });
                }
                break;
            case 'conclusion':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' });
                } else if (typeof value === 'string' && value.length > 1000) {
                    error = 'Conclusion must be less than 1000 characters';
                }
                break;
            case 'recommendation':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = intl.formatMessage({ id: 'VALIDATION.RECOMMENDATION.REQUIRED' });
                } else if (typeof value === 'string' && value.length > 1000) {
                    error = 'Recommendation must be less than 1000 characters';
                }
                break;
            case 'discussion':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' });
                } else if (typeof value === 'string' && value.length > 1000) {
                    error = 'Discussion must be less than 1000 characters';
                }
                break;
            case 'combatFunction':
                if (!value || value === 0) {
                    error = intl.formatMessage({ id: 'VALIDATION.COMBOT_FUNCTION.REQUIRED' });
                }
                break;
            case 'level':
                if (!value || value === 0) {
                    error = intl.formatMessage({ id: 'VALIDATION.LEVEL.REQUIRED' });
                }
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    const handleFieldChange = (fieldName: string, value: string | number) => {
        switch (fieldName) {
            case 'observationTitle':
                setObservationTitle(value as string);
                break;
            case 'conclusion':
                setConclusion(value as string);
                break;
            case 'recommendation':
                setRecommendationText(value as string);
                break;
            case 'discussion':
                setDiscussion(value as string);
                break;
            case 'combatFunction':
                setCombatFunction(typeof value === 'string' ? parseInt(value) || 0 : value as number);
                break;
            case 'level':
                setLevel(typeof value === 'string' ? parseInt(value) || 0 : value as number);
                break;
        }

        if (touched[fieldName as keyof typeof touched]) {
            validateField(fieldName, value);
        }
    };

    const handleFieldBlur = (fieldName: string, value: string | number) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, value);
    };


    const validateAllFields = () => {
        const fields = ['observationTitle', 'conclusion', 'recommendation', 'discussion', 'combatFunction', 'level'];
        const values = {
            observationTitle,
            conclusion,
            recommendation: recommendationText,
            discussion,
            combatFunction,
            level
        };

        let isValid = true;

        fields.forEach(field => {
            const value = values[field as keyof typeof values];
            if (!validateField(field, value)) {
                isValid = false;
            }
        });

        return isValid;
    };

    useEffect(() => {
        if (open) {
            console.log('Modal opened, loading dropdown options...');
            // Load Combot Function options
            dispatch(GetLookupValues({ lookupType: "Domain" }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {
                    if (originalPromiseResult.statusCode === 200) {
                        const response: ILookup[] = originalPromiseResult.data;
                        console.log('Combot Function options loaded:', response);
                        setCombotFunctionOptions(response);
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    console.error('Error loading combot function options:', rejectedValueOrSerializedError);
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                });

            // Load Level options
            dispatch(GetLookupValues({ lookupType: "Level" }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {
                    if (originalPromiseResult.statusCode === 200) {
                        const response: ILookup[] = originalPromiseResult.data;
                        console.log('Level options loaded:', response);
                        setLevelOptions(response);
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    console.error('Error loading level options:', rejectedValueOrSerializedError);
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                });
        }
    }, [dispatch, open]);

    const handleAddRecommendation = async () => {
        // Mark all fields as touched
        setTouched({
            observationTitle: true,
            conclusion: true,
            recommendation: true,
            discussion: true,
            combatFunction: true,
            level: true
        });

        // Validate all fields
        if (validateAllFields()) {
            dispatch(clearError());
            debugger
            try {
                if (isEditMode && editingRecommendation) {
                    // Update existing recommendation
                    await dispatch(updateRecommendationForObservation({

                        recommendationId: editingRecommendation.recommendationId,
                        recommendationData: {
                            recommendationId: editingRecommendation.recommendationId,
                            observationId: typeof observationId === 'string' ? parseInt(observationId) : observationId,
                            observationTitle,
                            conclusion,
                            recommendationText,
                            discussion,
                            combatFunction,
                            level,
                        }
                    })).unwrap();
                } else {
                    // Add new recommendation
                    debugger
                    await dispatch(saveRecommendationForObservation({
                        observationId: typeof observationId === 'string' ? parseInt(observationId) : observationId,
                        recommendationData: {
                            observationId: typeof observationId === 'string' ? parseInt(observationId) : observationId,
                            observationTitle,
                            conclusion,
                            recommendationText,
                            discussion,
                            combatFunction,
                            level,
                        }
                    })).unwrap();
                }

                // Reload recommendations after successful save/update
                await fetchRecommendationsFromAPI();
                handleClose();
            } catch (error) {
                console.error('Error saving recommendation:', error);
                writeToBrowserConsole(`Error saving recommendation for observation ${observationId}: ${error}`);
            }
        }
    };

    const createDeleteFunction = useCallback((id: number) => {
        return async () => {
            console.log('🗑️ createDeleteFunction called for ID:', id);
            console.log('🗑️ ID type:', typeof id, 'ID value:', id);

            if (!id || typeof id !== 'number') {
                console.error('🗑️ ERROR: Invalid ID in createDeleteFunction:', id);
                return;
            }

            dispatch(clearError());

            try {
                console.log('🗑️ About to dispatch delete with ID:', id);
                const result = await dispatch(deleteRecommendationForObservation({
                    recommendationId: id
                })).unwrap();

                console.log('🗑️ Delete successful, result:', result);
                // Reload recommendations after successful delete
                await fetchRecommendationsFromAPI();

                // Close modal and reset state
                setShowDeleteModal(false);
                setCurrentConfirmFunction(null);
            } catch (error) {
                console.error('Error deleting recommendation:', error);
                writeToBrowserConsole(`Error deleting recommendation ${id}: ${error}`);
            }
        };
    }, [dispatch]);

    const handleDeleteRecommendation = async (recommendationId: number | string) => {
        // Convert to number if it's a string
        debugger
        const numericId = typeof recommendationId === 'string' ? parseInt(recommendationId, 10) : recommendationId;

        console.log('🗑️ Delete clicked for recommendation ID:', recommendationId);
        console.log('🗑️ Original type:', typeof recommendationId, 'Original value:', recommendationId);
        console.log('🗑️ Converted to numericId:', numericId, 'type:', typeof numericId);

        // Validate recommendationId before proceeding
        if (!numericId || typeof numericId !== 'number' || isNaN(numericId)) {
            console.error('🗑️ ERROR: Invalid recommendationId received:', recommendationId, 'converted to:', numericId);
            return;
        }

        // Use the createDeleteFunction approach for better reliability
        const confirmFunction = createDeleteFunction(numericId);

        setCurrentConfirmFunction(() => confirmFunction);
        setShowDeleteModal(true);
        console.log('🗑️ Modal opened for numericId:', numericId);
    };

    const confirmDelete = async () => {
        console.log('🗑️ confirmDelete wrapper called');
        if (currentConfirmFunction) {
            await currentConfirmFunction();
        } else {
            console.log('🗑️ ERROR: No confirm function available');
        }
    };

    return (
        <>
            {/* Display the observationId on the page */}
            {/* <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                    🎯 Step 2 - Recommendations for Observation ID: {observationId}
                </Typography>
            </Box>
             */}
            {/* {console.log('Current recommendations array:', recommendations)} */}
            <div className="">
                <div className="row g-0">
                    <div className="col-md-11">
                    </div>
                    <div className="col-md-1 d-flex justify-content-end align-items-center">
                        <button
                            id="kt_modal_new_target_create_new"
                            className="btn MOD_btn btn-create w-10 pl-5"
                            onClick={handleOpen}
                        >
                            <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
                            <BtnLabeltxtMedium2
                                text={"BUTTON.LABEL.NEWSERVICE"}
                                isI18nKey={true}
                            />{" "}
                        </button>
                    </div>
                </div>
            </div>

            <Box sx={{ mt: 2 }}>
                <Modal
                    backdrop="static"
                    keyboard={false}
                    centered
                    size="lg"
                    animation={false}
                    enforceFocus={false}
                    restoreFocus={false}
                    dialogClassName="modal-dialog-scrollable"
                    aria-labelledby="contained-modal-title-vcenter"
                    show={open}
                    onHide={handleClose}

                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <HeaderLabels
                                text={
                                    isEditMode ?
                                        intl.formatMessage({ id: "LABEL.EDIT.RECOMMENDATION" }) :
                                        intl.formatMessage({ id: "LABEL.ADD.NEW.RECOMMENDATION" })
                                }
                            />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body  >
                        {/* ObservationTitle Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.RECOMMENDATION.TEXT" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <input
                                        type="text"
                                        autoComplete='off'
                                        className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.TITLE" })}
                                        value={observationTitle}
                                        onChange={(e) => handleFieldChange('observationTitle', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('observationTitle', e.target.value)}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.observationTitle && errors.observationTitle && (
                                        <div className="invalid-feedback d-block">{errors.observationTitle}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Combat Function and Level Dropdowns */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.COMBOT_FUNCTION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <DropdownListInModal
                                        className="w-100"
                                        dataKey="lookupId"
                                        dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                                        defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.COMBOT_FUNCTION" })}
                                        value={combatFunction ? combatFunction.toString() : ""}
                                        data={combotFunctionOptions || []}
                                        setSelectedValue={(value) => {
                                            console.log('Combat Function selected:', value);
                                            handleFieldChange('combatFunction', value);
                                            handleFieldBlur('combatFunction', value);
                                        }}
                                        isClearable={true}
                                    />


                                    {touched.combatFunction && errors.combatFunction && (
                                        <div className="invalid-feedback d-block">{errors.combatFunction}</div>
                                    )}
                                </div>
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.LEVEL" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <DropdownListInModal
                                        className="w-100"
                                        dataKey="lookupId"
                                        dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                                        defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.LEVEL" })}
                                        value={level ? level.toString() : ""}
                                        data={levelOptions || []}
                                        setSelectedValue={(value) => {
                                            console.log('Level selected:', value);
                                            handleFieldChange('level', value);
                                            handleFieldBlur('level', value);
                                        }}
                                        isClearable={true}
                                    />
                                    {touched.level && errors.level && (
                                        <div className="invalid-feedback d-block">{errors.level}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conclusion Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.CONCLUSION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.CONCLUSION" })}
                                        value={conclusion}
                                        onChange={(e) => handleFieldChange('conclusion', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('conclusion', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.conclusion && errors.conclusion && (
                                        <div className="invalid-feedback d-block">{errors.conclusion}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.RECOMMENDATION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.RECOMMENDATION" })}
                                        value={recommendationText}
                                        onChange={(e) => handleFieldChange('recommendation', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('recommendation', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.recommendation && errors.recommendation && (
                                        <div className="invalid-feedback d-block">{errors.recommendation}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discussion Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.DISCUSSION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.DISCUSSION" })}
                                        value={discussion}
                                        onChange={(e) => handleFieldChange('discussion', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('discussion', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.discussion && errors.discussion && (
                                        <div className="invalid-feedback d-block">{errors.discussion}</div>
                                    )}
                                </div>
                            </div>
                        </div>


                    </Modal.Body>
                    <Modal.Footer className="py-5 pt-4">
                        <button
                            type="button"
                            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                            onClick={handleAddRecommendation}
                            disabled={loading}
                        >
                            <BtnLabeltxtMedium2
                                text={isEditMode ? "BUTTON.LABEL.UPDATE" : "BUTTON.LABEL.SUBMIT"}
                            />
                            {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary mx-3"
                            onClick={handleClose}
                        >
                            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
                        </button>
                    </Modal.Footer>
                </Modal>

                <Box sx={{ mt: 3 }}>

                    {error && (
                        <Typography variant="body2" color="error" mb={2}>
                            {error}
                        </Typography>
                    )}

                    {loading && (
                        <Box display="flex" justifyContent="center" my={2}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">{intl.formatMessage({ id: "LABEL.LOADING" })}</span>
                            </div>
                        </Box>
                    )}

                    {!loading && recommendations.length === 0 ? (

                        <Box className="step-placeholder">
                            <p> {intl.formatMessage({ id: "LABEL.NO.RECOMMENDATIONS.YET" })}</p>
                        </Box>
                    ) : (
                        recommendations.map((rec, index) => {
                            // console.log('Rendering RecommendationDetails for rec:', rec.id, 'with handleEditRecommendation function:', typeof handleEditRecommendation);
                            // console.log('🗑️ Mapping recommendation:', rec);
                            // console.log('🗑️ rec.id:', rec.id, 'type:', typeof rec.id);

                            return (
                                <RecommendationDetails
                                    key={rec.recommendationId}
                                    recommendation={rec}
                                    text={`${rec.recommendationText}`}
                                    timestamp={new Date(rec.createdDate)}
                                    status="read"
                                    direction="rtl"
                                    observationId={rec.observationId}
                                    index={index + 1}
                                    recommendationId={rec.recommendationId}
                                    onEditClick={() => {

                                        console.log('onEditClick called for rec.recommendationId:', rec.recommendationId);
                                        handleEditRecommendation(rec.recommendationId);
                                    }}
                                    onDeleteClick={() => {
                                        handleDeleteRecommendation(rec.recommendationId);
                                    }}
                                />
                            );
                        })
                    )}
                </Box>
            </Box>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => {
                    console.log('🗑️ Modal onHide called - resetting state');
                    setShowDeleteModal(false);
                    setCurrentConfirmFunction(null);
                }}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HeaderLabels text={intl.formatMessage({ id: "LABEL.CONFIRM.DELETE" })} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ConfirmDeleteModal
                        setShow={setShowDeleteModal}
                        onConfirm={confirmDelete}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Recommendation;
