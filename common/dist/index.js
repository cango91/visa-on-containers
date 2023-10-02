"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericBackoffWithMaxRetry = exports.GenericBackoff = void 0;
////////////
// FUNCTIONS 
///////////
function GenericBackoff(func, backoff = 2000, max_backoff = 60000) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func();
        }
        catch (error) {
            yield new Promise(resolve => setTimeout(resolve, backoff));
            return GenericBackoff(func, Math.min(max_backoff, backoff * 2), max_backoff);
        }
    });
}
exports.GenericBackoff = GenericBackoff;
function GenericBackoffWithMaxRetry(func, backoff = 2000, retries = 10) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func();
        }
        catch (e) {
            if (retries <= 0) {
                throw new Error("Reached max retries");
            }
            yield new Promise(resolve => setTimeout(resolve, backoff));
            return GenericBackoffWithMaxRetry(func, backoff * 2, retries - 1);
        }
    });
}
exports.GenericBackoffWithMaxRetry = GenericBackoffWithMaxRetry;
