'use client';

import React from 'react';
import { Modal } from 'react-bootstrap';

interface AdminModalProps {
    show: boolean;
    onHide: () => void;
    title: string;
    children: React.ReactNode;
}

export const AdminModal = ({ show, onHide, title, children }: AdminModalProps) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            contentClassName="admin-modal-content"
        >
            <Modal.Header className="border-0 pb-0 d-flex justify-content-between">
                <Modal.Title className="text-white h5 fw-bold">{title}</Modal.Title>
                <button className="btn-close-custom" onClick={onHide}>
                    <img src="/images/icons/close.svg" alt="close" />
                </button>
            </Modal.Header>
            <Modal.Body className="pt-4">
                {children}
            </Modal.Body>
        </Modal>
    );
};