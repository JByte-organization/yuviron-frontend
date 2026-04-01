// 'use client';
//
// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { useCreateTrack } from '@repo/api/generated/endpoints/admin-tracks';
// import { useUploadFile } from '@repo/api/generated/endpoints/files';
//
// interface TrackFormProps {
//     onSuccess: () => void;
// }
//
// export const TrackForm = ({ onSuccess }: TrackFormProps) => {
//     const {
//         register,
//         handleSubmit,
//         setValue,
//         setError,
//         watch,
//         formState: { errors }
//     } = useForm({
//         defaultValues: {
//             explicit: false,
//             visibilityStatus: 1, // По умолчанию Published [cite: 720]
//             albumPosition: 1
//         }
//     });
//
//     const { mutateAsync: createTrack, isPending: isSaving } = useCreateTrack();
//     const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
//
//     // Отслеживаем загруженные пути для UI
//     const audioPath = watch('audioStorageKey');
//     const coverPath = watch('coverUrl');
//
//     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
//         const file = event.target.files?.[0];
//         if (!file) return;
//
//         const formData = new FormData();
//         formData.append('FileStream', file); // Ключ по контракту [cite: 1037]
//         formData.append('FileName', file.name);
//         formData.append('ContentType', file.type);
//
//         try {
//             const response = await uploadFile({ data: formData as any });
//             setValue(fieldName, response.path); // Сохраняем путь вида "temp/..." [cite: 1045]
//         } catch (err) {
//             alert("Ошибка загрузки файла");
//         }
//     };
//
//     const onSubmit = async (formData: any) => {
//         try {
//             // Превращаем строки ID в массивы, как требует API [cite: 721, 722]
//             const payload = {
//                 ...formData,
//                 artistIds: [formData.artistIds],
//                 genreIds: [formData.genreIds],
//                 moodIds: [formData.moodIds],
//                 albumPosition: Number(formData.albumPosition)
//             };
//
//             await createTrack({ data: payload });
//             onSuccess();
//         } catch (error: any) {
//             // Обработка 400 ошибок валидации с бэкенда [cite: 1193, 1194]
//             if (error.response?.status === 400 && error.response.data?.errors) {
//                 const backendErrors = error.response.data.errors;
//                 Object.keys(backendErrors).forEach((field) => {
//                     const formField = field.charAt(0).toLowerCase() + field.slice(1);
//                     setError(formField as any, {
//                         type: 'server',
//                         message: backendErrors[field][0]
//                     });
//                 });
//             }
//         }
//     };
//
//     return (
//         <Form onSubmit={handleSubmit(onSubmit)} className="admin-form text-white">
//             <Form.Group className="mb-3">
//                 <Form.Label>Track Title</Form.Label>
//                 <Form.Control
//                     {...register('title', { required: 'Title is required' })}
//                     isInvalid={!!errors.title}
//                     placeholder="Enter track name"
//                 />
//                 <Form.Control.Feedback type="invalid">{errors.title?.message as string}</Form.Control.Feedback>
//             </Form.Group>
//
//             <Row>
//                 <Col md={6}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Album ID (Guid)</Form.Label>
//                         <Form.Control {...register('albumId', { required: true })} placeholder="Guid" />
//                     </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Position in Album</Form.Label>
//                         <Form.Control type="number" {...register('albumPosition', { required: true })} />
//                     </Form.Group>
//                 </Col>
//             </Row>
//
//             <Row>
//                 <Col md={4}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Artist ID</Form.Label>
//                         <Form.Control {...register('artistIds', { required: true })} />
//                     </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Genre ID</Form.Label>
//                         <Form.Control {...register('genreIds', { required: true })} />
//                     </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Mood ID</Form.Label>
//                         <Form.Control {...register('moodIds', { required: true })} />
//                     </Form.Group>
//                 </Col>
//             </Row>
//
//             <Row>
//                 <Col md={6}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Audio File (.mp3/wav)</Form.Label>
//                         <div className={`upload-input ${audioPath ? 'border-success' : ''}`}>
//                             <input
//                                 type="file"
//                                 accept="audio/*"
//                                 onChange={(e) => handleFileChange(e, 'audioStorageKey')}
//                                 className="d-none"
//                                 id="audio-upload"
//                             />
//                             <label htmlFor="audio-upload" className="w-100 cursor-pointer p-2 text-center">
//                                 {audioPath ? '✅ Audio Uploaded' : 'Click to upload Audio'}
//                             </label>
//                         </div>
//                         <input type="hidden" {...register('audioStorageKey', { required: true })} />
//                     </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                     <Form.Group className="mb-3">
//                         <Form.Label>Track Cover (Optional)</Form.Label>
//                         <div className={`upload-input ${coverPath ? 'border-success' : ''}`}>
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={(e) => handleFileChange(e, 'coverUrl')}
//                                 className="d-none"
//                                 id="cover-upload"
//                             />
//                             <label htmlFor="cover-upload" className="w-100 cursor-pointer p-2 text-center">
//                                 {coverPath ? '✅ Cover Uploaded' : 'Click to upload Picture'}
//                             </label>
//                         </div>
//                         <input type="hidden" {...register('coverUrl')} />
//                     </Form.Group>
//                 </Col>
//             </Row>
//
//             <Form.Check
//                 type="checkbox"
//                 label="Explicit Content (18+)"
//                 className="mb-4"
//                 {...register('explicit')}
//             />
//
//             <div className="d-flex justify-content-end gap-2">
//                 <Button
//                     type="submit"
//                     variant="primary"
//                     className="save-btn px-5 text-dark fw-bold"
//                     disabled={isSaving || isUploading}
//                 >
//                     {isSaving ? <Spinner size="sm" /> : 'Save Track'}
//                 </Button>
//             </div>
//         </Form>
//     );
// };