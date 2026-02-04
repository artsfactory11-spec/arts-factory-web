import mongoose from 'mongoose';

const MagazineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '제목을 입력해주세요.'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, '내용을 입력해주세요.'],
    },
    thumbnail_url: {
        type: String,
        required: [true, '썸네일 이미지를 등록해주세요.'],
    },
    category: {
        type: String,
        enum: ['Notice', 'Interview', 'Story', 'Exhibition'],
        default: 'Story',
    },
    author: {
        type: String,
        default: 'Arts Factory Admin',
    },
    is_published: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    view_count: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export default mongoose.models.Magazine || mongoose.model('Magazine', MagazineSchema);
