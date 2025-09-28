import React from 'react';
import { useIntl } from 'react-intl';
import { IComment } from '../models/commentModel';
import './Comments.css';

interface CommentsProps {
    observationId: number | string;
    comment?: IComment; // Changed from comments array to single comment
    showLatestOnly?: boolean; // New prop to show only the latest comment
}

const Comments: React.FC<CommentsProps> = ({
    observationId,
    comment,
    showLatestOnly = false
}) => {
    const intl = useIntl();

    // Convert single comment to array format for consistent processing
    const commentsArray = comment && comment.isActive ? [comment] : [];

    // Sort comments by date (newest first) and optionally show only the latest
    const sortedComments = [...commentsArray]
        .filter(comment => comment.isActive)
        .sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateB.getTime() - dateA.getTime();
        });

    // If showLatestOnly is true, only show the first (latest) comment
    const displayComments = showLatestOnly ? sortedComments.slice(0, 1) : sortedComments;

    const formatDate = (date: Date | string) => {
        // Convert string to Date object if necessary
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        const dateString = new Intl.DateTimeFormat(intl.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(dateObj);

        // Remove the colon from the time portion and reverse for Arabic
        let formattedString = dateString.replace(/(\d{2}):(\d{2})/, (match, hours, minutes) => {
            // For Arabic locale, reverse the time format (1137 becomes 7311)
            if (intl.locale.includes('ar')) {
                return minutes + hours;
            }
            return hours + minutes;
        });

        return formattedString;
    };

    return (
        <div className="comments-container">
            <div className="comments-content">
                {/* Comments List */}
                <div className="comments-list">
                    {displayComments.length === 0 ? (
                        showLatestOnly ? null : (
                            <div className="no-comments text-center text-muted py-4">
                                <p>
                                    {intl.formatMessage({ id: "MESSAGE.NO.APPROVAL.COMMENTS" }) || "No approval comments yet"}
                                </p>
                            </div>
                        )
                    ) : (
                        displayComments.map((comment) => (
                            <div key={comment.id} className="comment-item card mb-3">
                                <div className="card-body">
                                    <div className="comment-header d-flex justify-content-between align-items-start mb-2">
                                        <div className="comment-author">
                                            <strong>{comment.author}</strong>
                                        </div>
                                        <div className="comment-date text-muted small">
                                            {formatDate(comment.date)}
                                        </div>
                                    </div>
                                    <div className="comment-text">
                                        <p className="mb-0">{comment.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comments;