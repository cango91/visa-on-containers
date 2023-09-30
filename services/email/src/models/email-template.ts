import mongoose, { Schema } from "mongoose";

const emailTemplateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    bodyHtml: {
        type: String,
    },
    variables: {
        type: [String]
    }
}, {
    timestamps: true,
});

emailTemplateSchema.pre("save", function (next) {
    if (this.isModified("variables") && this.variables && this.variables.length) {
        const regexErrors = this.variables.filter(variable => !/^\$__.+$/.test(variable));

        const checkFieldForVars = (field: string, variables: string[]) => {
            return variables.filter(variable => {
                const escapedVar = variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                return !new RegExp(escapedVar, "gi").test(field);
            });
        };

        const missingVars = this.variables.filter(variable => {
            return ['body', 'subject', 'bodyHtml'].every(field => {
                return checkFieldForVars((this as any)[field], [variable]).length > 0;
            });
        });

        if (regexErrors.length > 0) {
            return next(new Error(`Variables ${regexErrors.join(', ')} do not conform to pattern $__variablename`));
        }

        if (missingVars.length > 0) {
            return next(new Error(`Variables ${missingVars.join(', ')} are not present in the email body, subject, or bodyHtml`));
        }

        return next();
    }
});



export default mongoose.model('EmailTemplate', emailTemplateSchema);