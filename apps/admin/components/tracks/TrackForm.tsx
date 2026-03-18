'use client';

import { Form, Row, Col, Button } from 'react-bootstrap';

export const TrackForm = ({ onSave }: { onSave: (data: any) => void }) => {
    return (
        <Form className="admin-form">
            <Form.Group className="mb-3">
                <Form.Label>Name Track</Form.Label>
                <Form.Control placeholder="Content" />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>ID</Form.Label>
                        <Form.Control placeholder="ID" />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>ArtistId</Form.Label>
                        <Form.Control placeholder="Start Type" />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>AlbumId</Form.Label>
                        <Form.Select className="admin-select">
                            <option>Album</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>SeqNumber</Form.Label>
                        <Form.Control placeholder="SeqNumber" />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>GenreId</Form.Label>
                        <Form.Select className="admin-select"><option>Chose</option></Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>TagsId</Form.Label>
                        <Form.Select className="admin-select"><option>Chose</option></Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Import Track</Form.Label>
                        <div className="upload-input">
                            <span>Import track</span>
                            <img src="/images/icons/upload.svg" alt="upload" />
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Import Picture</Form.Label>
                        <div className="upload-input">
                            <span>Import Picture</span>
                            <img src="/images/icons/upload.svg" alt="upload" />
                        </div>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label>Info</Form.Label>
                <Form.Control as="textarea" rows={4} placeholder="Placeholder content" />
            </Form.Group>

            <div className="d-flex justify-content-end">
                <Button variant="primary" className="save-btn px-5 text-dark fw-bold">Save</Button>
            </div>
        </Form>
    );
};