import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    siteName: string;
    siteDescription: string;
    companyName: string;
    representative: string;
    businessNumber: string;
    mailOrderNumber: string;
    address: string;
    phone: string;
    fax?: string;
    email: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    operationHours: string;
    snsLinks: {
        instagram?: string;
        blog?: string;
        youtube?: string;
        kakaotalk?: string;
    };
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
    siteName: { type: String, default: 'ARTS FACTORY' },
    siteDescription: { type: String, default: '공간에 예술을 채우다' },
    companyName: { type: String, default: '(주)아츠팩토리' },
    representative: { type: String, default: '이효주' },
    businessNumber: { type: String, default: '227-13-96095' },
    mailOrderNumber: { type: String, default: '제2020-광주동구-0011호' },
    address: { type: String, default: '광주광역시 동구 문화전당로23번길 7, 2층 202호(남동)' },
    phone: { type: String, default: '062.224.0801' },
    fax: { type: String, default: '062.224.0901' },
    email: { type: String, default: 'artrental09@naver.com' },
    bankName: { type: String, default: 'IBK기업은행' },
    accountNumber: { type: String, default: '187-082975-01-013' },
    accountHolder: { type: String, default: '(예술공장)' },
    operationHours: { type: String, default: 'MON-FRI 10:00 - 18:00 / SAT 10:00 - 14:00 (LUNCH 12:00 ~ 13:00 / 주말, 공휴일 휴무)' },
    snsLinks: {
        instagram: { type: String, default: '' },
        blog: { type: String, default: '' },
        youtube: { type: String, default: '' },
        kakaotalk: { type: String, default: '' },
    }
}, { timestamps: true });

// Next.js HMR 등으로 인해 이전 스키마가 캐싱되는 것을 방지하기 위해 개발 환경에서만 캐시 삭제 시도
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.Settings) {
    delete mongoose.models.Settings;
}

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
