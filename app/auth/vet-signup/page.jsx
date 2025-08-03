// app/auth/vet-signup/page.jsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/context/NotificationContext';
import { UploadCloud } from 'lucide-react';

export default function VetSignupPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', specialization: '', yearsExperience: '', licenseNumber: '' });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotification();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            addNotification('Please upload your qualification document.', 'error');
            return;
        }
        setIsSubmitting(true);

        const formPayload = new FormData();
        formPayload.append('file', file);
        // Append other form data fields
        Object.keys(formData).forEach(key => {
            formPayload.append(key, formData[key]);
        });

        try {
            const res = await fetch('/api/auth/vet-signup', {
                method: 'POST',
                body: formPayload,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            addNotification('Registration successful! Your application is under review.', 'success');
            router.push('/auth/signin');

        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-lg p-8 space-y-6 card">
                <h1 className="text-2xl font-bold text-center">Veterinarian Registration</h1>
                <p className="text-center text-sm text-[color:var(--muted-foreground)]">Submit your application to join our network of verified professionals.</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" onChange={handleChange} placeholder="Full Name" className="input" required />
                        <input name="email" type="email" onChange={handleChange} placeholder="Email Address" className="input" required />
                    </div>
                    <input name="password" type="password" onChange={handleChange} placeholder="Create Password" className="input" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="specialization" onChange={handleChange} placeholder="Specialization (e.g., Poultry)" className="input" required />
                        <input name="yearsExperience" type="number" onChange={handleChange} placeholder="Years of Experience" className="input" required />
                    </div>
                    <input name="licenseNumber" onChange={handleChange} placeholder="License Number (Optional)" className="input" />
                    
                    <div>
                        <label className="form-label">Qualification Document (PDF, JPG, PNG)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-[color:var(--muted-foreground)]" />
                                <div className="flex text-sm">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-dark)]">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {file && <p className="text-xs">{file.name}</p>}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
}
