import React, { forwardRef, useImperativeHandle } from 'react'
type props = {
  entityId: number;
  serviceId: number;
  onSuccess?: () => void;
};
const Support = forwardRef<any, props>(({ entityId, serviceId, onSuccess }, ref) => {
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (onSuccess) onSuccess();
    }
  }));
  return (
    <div>Support</div>
  )
});

export default Support;
