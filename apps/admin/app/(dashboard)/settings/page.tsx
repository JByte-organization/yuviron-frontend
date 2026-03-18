'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { adminService, Admin } from '@repo/api';

export default function SettingsPage() {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await adminService.getMyProfile();
                setAdmin(data);
                setName(data.name);
                setEmail(data.email);
                setAvatarPreview(data.avatarUrl || '/default-avatar.png');
            } catch (err) {
                setFeedback({ type: 'danger', text: 'Ошибка при загрузке профиля' });
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (password && password !== confirmPassword) {
            setFeedback({ type: 'danger', text: 'Пароли не совпадают!' });
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (password) formData.append('password', password);
            if (avatar) formData.append('avatar', avatar);

            const updatedAdmin = await adminService.updateMyProfile(formData);
            setAdmin(updatedAdmin);
            setFeedback({ type: 'success', text: 'Профиль успешно обновлен' });
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setFeedback({ type: 'danger', text: 'Не удалось сохранить изменения' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="cyan" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-cyan mb-5 fw-bold">Admin Settings</h2>

            {feedback && (
                <Alert variant={feedback.type} className="mb-4 border-0 shadow-sm">
                    {feedback.text}
                </Alert>
            )}

            <Row className="g-5">
                {/* Левая колонка: Форма */}
                <Col lg={8}>
                    <div className="bg-dark-soft p-4 rounded-4 border border-secondary">
                        <h4 className="mb-4 text-white">Personal Information</h4>

                        <Form onSubmit={handleSubmit}>
                            {/* Аватар */}
                            <div className="d-flex align-items-center gap-4 mb-5">
                                <div className="position-relative">
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="rounded-circle border border-cyan p-1"
                                        style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="cyan"
                                        className="position-absolute bottom-0 end-0 rounded-circle"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="bi bi-camera-fill"></i>
                                    </Button>
                                </div>
                                <div>
                                    <h6 className="mb-1 text-white">Profile Photo</h6>
                                    <p className="small text-whitemb-0">JPEG or PNG. Max 2MB.</p>
                                </div>
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                            </div>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white h5 text-uppercase">Display Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-dark text-white border-secondary p-2"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white h5 text-uppercase">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-dark text-white border-secondary p-2"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className="my-4 border-secondary opacity-25" />
                            <h4 className="mb-4 text-white">Security</h4>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white h5 text-uppercase">New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Leave blank to skip"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-dark text-white border-secondary p-2"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white h5 text-uppercase">Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-dark text-white border-secondary p-2"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    variant="cyan"
                                    type="submit"
                                    className="btn btn-primary d-flex align-items-center gap-2 py-2 px-3 text-dark fw-bold"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>

                {/* Правая колонка: Статус и доступы */}
                <Col lg={4}>
                    <div className="bg-dark-soft p-4 rounded-4 border border-secondary mb-4">
                        <h5 className="text-white mb-3">Your Role</h5>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <Badge bg="cyan" className="text-white fw-bold">
                                {admin?.role || 'ADMIN'}
                            </Badge>
                        </div>
                        <div className="pt-2 border-top border-secondary opacity-50 mt-2">
                            <p className="small text-whitemb-1">Last login:</p>
                            <span className="text-white small">
                                {admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Active now'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-dark-soft p-4 rounded-4 border border-secondary">
                        <h5 className="text-white mb-3">Permissions</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {admin?.permissions?.map(perm => (
                                <Badge key={perm} bg="dark" className="border border-secondary text-whitepy-2 fw-normal">
                                    {perm}
                                </Badge>
                            )) || <span className="small text-muted">Standard Management Access</span>}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}