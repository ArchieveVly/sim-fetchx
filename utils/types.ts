export interface IFetch {
	baseUrl: string;
	timeout: number;
	retry: bool;
	retryNumber: number | 5;
	options:Record< string,any > ;
}

export type SFetchError = {
	error: string | Record < string,
	any > ;
	hint: string;
	learnMore: string;
};

export type IOption = Record < string, any >