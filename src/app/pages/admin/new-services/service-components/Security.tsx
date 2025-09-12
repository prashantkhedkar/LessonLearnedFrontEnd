import React from 'react'

type props = {
  entityId: number;
  serviceId: number;
  onSuccess?: () => void;
};
export default function Security({ entityId, serviceId, onSuccess }: props) {
  return (
    <div>Security </div>  
  )
}

