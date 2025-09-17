import React, { useState } from 'react';
import contactImg from './Imgs/Contact_us.jpg';
import './CSS/contact.css'
export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        desc: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add API call or form submission logic here
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Image Section */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow dark:bg-gray-900 dark:border-gray-800">
                    <img src={contactImg} alt="Contact" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Contact Form */}
                <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white shadow dark:bg-gray-900 dark:border-gray-800">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Get in Touch</h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">We'd love to hear from you. Fill out the form and we'll get back to you.</p>
                    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full name"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <textarea
                                name="desc"
                                placeholder="Message"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none h-32 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                value={formData.desc}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="inline-flex items-center rounded-md bg-brand text-white px-5 py-2.5 font-semibold hover:bg-brand-dark transition">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}