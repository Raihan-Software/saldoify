// Mock data for frontend development without backend

// Define types locally to avoid server dependencies
export interface Asset {
	id: string;
	userId: string;
	type: 'liquid' | 'non_liquid' | 'investment';
	assetTypeId: string;
	name: string;
	description?: string | null;
	currentValue: string;
	purchaseValue?: string | null;
	purchaseDate?: Date | null;
	accountNumber?: string | null;
	bankName?: string | null;
	location?: string | null;
	quantity?: number | null;
	ticker?: string | null;
	shares?: string | null;
	notes?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Debt {
	id: string;
	userId: string;
	name: string;
	debtTypeId: string;
	balance: string;
	originalAmount?: string | null;
	interestRate?: string | null;
	monthlyPayment?: string | null;
	startDate?: Date | null;
	dueDate?: Date | null;
	notes?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Transaction {
	id: string;
	userId: string;
	type: 'income' | 'expense';
	categoryId: string;
	description: string;
	amount: string;
	assetId: string;
	transactionDate: Date;
	notes?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface AssetType {
	id: string;
	userId: string;
	category: string;
	label: string;
	icon: string;
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface DebtType {
	id: string;
	userId: string;
	label: string;
	icon: string;
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TransactionCategory {
	id: string;
	userId: string;
	type: string;
	label: string;
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserPreferences {
	id: string;
	userId: string;
	currencyCode: string;
	currencyDisplay: string;
	numberFormat: string;
	compactNumbers: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Mock user ID
export const MOCK_USER_ID = 'mock-user-123';

// Mock asset types
export const mockAssetTypes: Record<string, AssetType[]> = {
	liquid: [
		{ id: 'at1', userId: MOCK_USER_ID, category: 'liquid', label: 'Cash', icon: '💵', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at2', userId: MOCK_USER_ID, category: 'liquid', label: 'Checking Account', icon: '🏦', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at3', userId: MOCK_USER_ID, category: 'liquid', label: 'Savings Account', icon: '💰', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at4', userId: MOCK_USER_ID, category: 'liquid', label: 'Money Market', icon: '📈', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at5', userId: MOCK_USER_ID, category: 'liquid', label: 'Cash App', icon: '📱', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at6', userId: MOCK_USER_ID, category: 'liquid', label: 'PayPal', icon: '💳', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	],
	non_liquid: [
		{ id: 'at7', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Real Estate', icon: '🏠', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at8', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Vehicle', icon: '🚗', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at9', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Jewelry', icon: '💎', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at10', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Electronics', icon: '💻', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at11', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Collectibles', icon: '🎨', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at12', userId: MOCK_USER_ID, category: 'non_liquid', label: 'Business Equipment', icon: '🏢', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	],
	investment: [
		{ id: 'at13', userId: MOCK_USER_ID, category: 'investment', label: 'Stocks', icon: '📊', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at14', userId: MOCK_USER_ID, category: 'investment', label: 'Bonds', icon: '📜', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at15', userId: MOCK_USER_ID, category: 'investment', label: 'Mutual Funds', icon: '🏛️', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at16', userId: MOCK_USER_ID, category: 'investment', label: 'ETFs', icon: '📈', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at17', userId: MOCK_USER_ID, category: 'investment', label: 'Cryptocurrency', icon: '₿', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at18', userId: MOCK_USER_ID, category: 'investment', label: 'Retirement Account', icon: '🏖️', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'at19', userId: MOCK_USER_ID, category: 'investment', label: 'Commodities', icon: '🛢️', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	]
};

// Mock debt types
export const mockDebtTypes: DebtType[] = [
	{ id: 'dt1', userId: MOCK_USER_ID, label: 'Mortgage', icon: '🏠', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt2', userId: MOCK_USER_ID, label: 'Auto Loan', icon: '🚗', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt3', userId: MOCK_USER_ID, label: 'Credit Card', icon: '💳', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt4', userId: MOCK_USER_ID, label: 'Personal Loan', icon: '💸', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt5', userId: MOCK_USER_ID, label: 'Student Loan', icon: '🎓', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt6', userId: MOCK_USER_ID, label: 'Business Loan', icon: '💼', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt7', userId: MOCK_USER_ID, label: 'Medical Debt', icon: '🏥', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
	{ id: 'dt8', userId: MOCK_USER_ID, label: 'Other', icon: '📄', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
];

// Mock transaction categories
export const mockTransactionCategories: Record<string, TransactionCategory[]> = {
	income: [
		{ id: 'tc1', userId: MOCK_USER_ID, type: 'income', label: 'Salary', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc2', userId: MOCK_USER_ID, type: 'income', label: 'Freelance', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc3', userId: MOCK_USER_ID, type: 'income', label: 'Investment Income', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc4', userId: MOCK_USER_ID, type: 'income', label: 'Business Income', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc5', userId: MOCK_USER_ID, type: 'income', label: 'Rental Income', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc6', userId: MOCK_USER_ID, type: 'income', label: 'Interest', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc7', userId: MOCK_USER_ID, type: 'income', label: 'Dividends', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc8', userId: MOCK_USER_ID, type: 'income', label: 'Gift', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc9', userId: MOCK_USER_ID, type: 'income', label: 'Refund', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc10', userId: MOCK_USER_ID, type: 'income', label: 'Other Income', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	],
	expense: [
		{ id: 'tc11', userId: MOCK_USER_ID, type: 'expense', label: 'Food & Dining', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc12', userId: MOCK_USER_ID, type: 'expense', label: 'Groceries', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc13', userId: MOCK_USER_ID, type: 'expense', label: 'Transportation', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc14', userId: MOCK_USER_ID, type: 'expense', label: 'Shopping', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc15', userId: MOCK_USER_ID, type: 'expense', label: 'Entertainment', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc16', userId: MOCK_USER_ID, type: 'expense', label: 'Bills & Utilities', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc17', userId: MOCK_USER_ID, type: 'expense', label: 'Healthcare', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc18', userId: MOCK_USER_ID, type: 'expense', label: 'Education', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc19', userId: MOCK_USER_ID, type: 'expense', label: 'Home', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc20', userId: MOCK_USER_ID, type: 'expense', label: 'Personal Care', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc21', userId: MOCK_USER_ID, type: 'expense', label: 'Gifts & Donations', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc22', userId: MOCK_USER_ID, type: 'expense', label: 'Insurance', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc23', userId: MOCK_USER_ID, type: 'expense', label: 'Taxes', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc24', userId: MOCK_USER_ID, type: 'expense', label: 'Other Expense', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	],
	transfer: [
		{ id: 'tc25', userId: MOCK_USER_ID, type: 'transfer', label: 'Account Transfer', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc26', userId: MOCK_USER_ID, type: 'transfer', label: 'Investment Transfer', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc27', userId: MOCK_USER_ID, type: 'transfer', label: 'Loan Payment', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc28', userId: MOCK_USER_ID, type: 'transfer', label: 'Credit Card Payment', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc29', userId: MOCK_USER_ID, type: 'transfer', label: 'Family Transfer', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
		{ id: 'tc30', userId: MOCK_USER_ID, type: 'transfer', label: 'Savings Transfer', isSystem: true, createdAt: new Date(), updatedAt: new Date() }
	]
};

// Mock assets
export const mockAssets: (Asset & { assetType: AssetType })[] = [
	// Liquid assets
	{
		id: 'a1',
		userId: MOCK_USER_ID,
		type: 'liquid',
		assetTypeId: 'at2',
		name: 'Chase Checking',
		description: 'Primary checking account',
		currentValue: '2500.00',
		purchaseValue: null,
		purchaseDate: null,
		accountNumber: '****1234',
		bankName: 'Chase Bank',
		location: null,
		quantity: null,
		ticker: null,
		shares: null,
		notes: 'Main checking account for daily expenses',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.liquid[1]
	},
	{
		id: 'a2',
		userId: MOCK_USER_ID,
		type: 'liquid',
		assetTypeId: 'at3',
		name: 'High Yield Savings',
		description: 'Emergency fund savings',
		currentValue: '15000.00',
		purchaseValue: null,
		purchaseDate: null,
		accountNumber: '****5678',
		bankName: 'Ally Bank',
		location: null,
		quantity: null,
		ticker: null,
		shares: null,
		notes: 'Emergency fund with 4.5% APY',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.liquid[2]
	},
	{
		id: 'a3',
		userId: MOCK_USER_ID,
		type: 'liquid',
		assetTypeId: 'at1',
		name: 'Cash',
		description: 'Physical cash on hand',
		currentValue: '500.00',
		purchaseValue: null,
		purchaseDate: null,
		accountNumber: null,
		bankName: null,
		location: null,
		quantity: null,
		ticker: null,
		shares: null,
		notes: 'Cash for small purchases',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.liquid[0]
	},
	// Non-liquid assets
	{
		id: 'a4',
		userId: MOCK_USER_ID,
		type: 'non_liquid',
		assetTypeId: 'at7',
		name: 'Primary Residence',
		description: '3-bedroom house in downtown',
		currentValue: '450000.00',
		purchaseValue: '420000.00',
		purchaseDate: new Date('2020-03-15'),
		accountNumber: null,
		bankName: null,
		location: '123 Main St, City, State',
		quantity: 1,
		ticker: null,
		shares: null,
		notes: 'Primary residence with 2.5% mortgage',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.non_liquid[0]
	},
	{
		id: 'a5',
		userId: MOCK_USER_ID,
		type: 'non_liquid',
		assetTypeId: 'at8',
		name: '2021 Honda Civic',
		description: 'Reliable daily driver',
		currentValue: '22000.00',
		purchaseValue: '28000.00',
		purchaseDate: new Date('2021-06-10'),
		accountNumber: null,
		bankName: null,
		location: 'Garage',
		quantity: 1,
		ticker: null,
		shares: null,
		notes: 'Well maintained, low mileage',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.non_liquid[1]
	},
	// Investment assets
	{
		id: 'a6',
		userId: MOCK_USER_ID,
		type: 'investment',
		assetTypeId: 'at13',
		name: 'AAPL Stock',
		description: 'Apple Inc. shares',
		currentValue: '15000.00',
		purchaseValue: '12000.00',
		purchaseDate: new Date('2022-01-15'),
		accountNumber: null,
		bankName: null,
		location: null,
		quantity: null,
		ticker: 'AAPL',
		shares: '100.0000',
		notes: 'Long-term growth investment',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.investment[0]
	},
	{
		id: 'a7',
		userId: MOCK_USER_ID,
		type: 'investment',
		assetTypeId: 'at18',
		name: '401(k) Retirement',
		description: 'Company 401(k) with matching',
		currentValue: '85000.00',
		purchaseValue: '65000.00',
		purchaseDate: new Date('2019-01-01'),
		accountNumber: '****9012',
		bankName: 'Fidelity',
		location: null,
		quantity: null,
		ticker: null,
		shares: null,
		notes: 'Diversified portfolio with company match',
		createdAt: new Date(),
		updatedAt: new Date(),
		assetType: mockAssetTypes.investment[5]
	}
];

// Mock debts
export const mockDebts: (Debt & { debtType: DebtType })[] = [
	{
		id: 'd1',
		userId: MOCK_USER_ID,
		name: 'Primary Mortgage',
		debtTypeId: 'dt1',
		balance: '380000.00',
		originalAmount: '420000.00',
		interestRate: '2.50',
		monthlyPayment: '1650.00',
		startDate: new Date('2020-03-15'),
		dueDate: new Date('2050-03-15'),
		notes: '30-year fixed rate mortgage',
		createdAt: new Date(),
		updatedAt: new Date(),
		debtType: mockDebtTypes[0]
	},
	{
		id: 'd2',
		userId: MOCK_USER_ID,
		name: 'Auto Loan',
		debtTypeId: 'dt2',
		balance: '18000.00',
		originalAmount: '25000.00',
		interestRate: '3.25',
		monthlyPayment: '450.00',
		startDate: new Date('2021-06-10'),
		dueDate: new Date('2026-06-10'),
		notes: '5-year auto loan for Honda Civic',
		createdAt: new Date(),
		updatedAt: new Date(),
		debtType: mockDebtTypes[1]
	},
	{
		id: 'd3',
		userId: MOCK_USER_ID,
		name: 'Chase Credit Card',
		debtTypeId: 'dt3',
		balance: '2500.00',
		originalAmount: '2500.00',
		interestRate: '18.99',
		monthlyPayment: '75.00',
		startDate: new Date('2023-01-01'),
		dueDate: null,
		notes: 'Credit card for daily expenses',
		createdAt: new Date(),
		updatedAt: new Date(),
		debtType: mockDebtTypes[2]
	}
];

// Mock transactions
export const mockTransactions: (Transaction & { category: TransactionCategory; account: { id: string; name: string; bankName: string | null } })[] = [
	{
		id: 't1',
		userId: MOCK_USER_ID,
		type: 'income',
		categoryId: 'tc1',
		description: 'Monthly Salary',
		amount: '5500.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-15'),
		notes: 'Regular monthly salary deposit',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.income[0],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't2',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc12',
		description: 'Grocery Shopping',
		amount: '150.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-14'),
		notes: 'Weekly grocery shopping at Whole Foods',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[1],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't3',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc13',
		description: 'Gas Station',
		amount: '45.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-13'),
		notes: 'Gas for the week',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[2],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't4',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc16',
		description: 'Electric Bill',
		amount: '120.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-12'),
		notes: 'Monthly electricity bill',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[5],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't5',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc11',
		description: 'Restaurant Dinner',
		amount: '85.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-11'),
		notes: 'Date night dinner',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[0],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't6',
		userId: MOCK_USER_ID,
		type: 'income',
		categoryId: 'tc3',
		description: 'Stock Dividend',
		amount: '75.00',
		assetId: 'a6',
		transactionDate: new Date('2024-01-10'),
		notes: 'Quarterly dividend from AAPL',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.income[2],
		account: { id: 'a6', name: 'AAPL Stock', bankName: null }
	},
	{
		id: 't7',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc14',
		description: 'Online Shopping',
		amount: '200.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-09'),
		notes: 'Amazon purchases',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[3],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't8',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc15',
		description: 'Movie Tickets',
		amount: '25.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-08'),
		notes: 'Weekend movie with friends',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[4],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't9',
		userId: MOCK_USER_ID,
		type: 'expense',
		categoryId: 'tc17',
		description: 'Doctor Visit',
		amount: '150.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-07'),
		notes: 'Annual checkup',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.expense[6],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	},
	{
		id: 't10',
		userId: MOCK_USER_ID,
		type: 'income',
		categoryId: 'tc2',
		description: 'Freelance Project',
		amount: '1200.00',
		assetId: 'a1',
		transactionDate: new Date('2024-01-06'),
		notes: 'Web development project completion',
		createdAt: new Date(),
		updatedAt: new Date(),
		category: mockTransactionCategories.income[1],
		account: { id: 'a1', name: 'Chase Checking', bankName: 'Chase Bank' }
	}
];

// Mock user preferences
export const mockUserPreferences: UserPreferences = {
	id: 'pref1',
	userId: MOCK_USER_ID,
	currencyCode: 'USD',
	currencyDisplay: 'symbol',
	numberFormat: '1,234,567.89',
	compactNumbers: false,
	createdAt: new Date(),
	updatedAt: new Date()
};

// Common currencies list (matching the dropdown in settings)
export const commonCurrencies = [
	{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
	{ code: 'USD', name: 'US Dollar', symbol: '$' },
	{ code: 'EUR', name: 'Euro', symbol: '€' },
	{ code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
	{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
	{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
	{ code: 'GBP', name: 'British Pound', symbol: '£' },
	{ code: 'AUD', name: 'Australian Dollar', symbol: '$' }
];

// Number format options (matching the dropdown in settings)
export const numberFormats = [
	{ value: '1.234.567,89', label: '1.234.567,89 (Indonesia)', thousandSep: '.', decimalSep: ',' },
	{ value: '1,234,567.89', label: '1,234,567.89 (US/UK)', thousandSep: ',', decimalSep: '.' },
	{ value: '1 234 567,89', label: '1 234 567,89 (France)', thousandSep: ' ', decimalSep: ',' },
	{ value: '1\'234\'567.89', label: '1\'234\'567.89 (Switzerland)', thousandSep: '\'', decimalSep: '.' }
];

// Helper functions to get mock data
export function getMockAssetsByType(type: 'liquid' | 'non_liquid' | 'investment') {
	return mockAssets.filter(asset => asset.type === type);
}

export function getMockAssetSummaryByType(type: 'liquid' | 'non_liquid' | 'investment') {
	const assets = getMockAssetsByType(type);
	
	const totalValue = assets.reduce((sum, asset) => {
		return sum + (parseFloat(asset.currentValue) || 0);
	}, 0);
	
	const totalPurchaseValue = assets.reduce((sum, asset) => {
		return sum + (parseFloat(asset.purchaseValue || '0') || 0);
	}, 0);
	
	const growth = totalPurchaseValue > 0 
		? ((totalValue - totalPurchaseValue) / totalPurchaseValue) * 100 
		: 0;
	
	return {
		count: assets.length,
		totalValue,
		totalPurchaseValue,
		growth
	};
}

export function getMockDebtSummary() {
	const totalDebt = mockDebts.reduce((sum, debt) => 
		sum + (parseFloat(debt.balance) || 0), 0
	);
	
	const totalMonthlyPayment = mockDebts.reduce((sum, debt) => 
		sum + (parseFloat(debt.monthlyPayment || '0') || 0), 0
	);
	
	const totalOriginal = mockDebts.reduce((sum, debt) => 
		sum + (parseFloat(debt.originalAmount || debt.balance) || 0), 0
	);
	
	const totalPaidOff = totalOriginal - totalDebt;
	const paidOffPercentage = totalOriginal > 0 ? (totalPaidOff / totalOriginal) * 100 : 0;
	
	const averageInterestRate = mockDebts.length > 0
		? mockDebts.reduce((sum, debt) => sum + (parseFloat(debt.interestRate || '0') || 0), 0) / 
		  mockDebts.filter(d => d.interestRate).length || 0
		: 0;
	
	return {
		count: mockDebts.length,
		totalDebt,
		totalMonthlyPayment,
		totalOriginal,
		totalPaidOff,
		paidOffPercentage,
		averageInterestRate
	};
}

export function getMockMonthlyTransactionSummary(year: number, month: number) {
	const startDate = new Date(year, month - 1, 1);
	const endDate = new Date(year, month, 0, 23, 59, 59, 999);
	
	const monthTransactions = mockTransactions.filter(t => {
		return t.transactionDate >= startDate && t.transactionDate <= endDate && t.category.type !== 'transfer';
	});
	
	const summary = {
		income: 0,
		expense: 0
	};
	
	monthTransactions.forEach(t => {
		if (t.type === 'income') {
			summary.income += parseFloat(t.amount);
		} else if (t.type === 'expense') {
			summary.expense += parseFloat(t.amount);
		}
	});
	
	return summary;
}

export function getMockRecentTransactions(limit: number = 10) {
	return mockTransactions.slice(0, limit);
}

export function getMockDebts() {
	return mockDebts;
}

export function getMockTopSpendingCategories(year: number, month: number, limit: number = 5) {
	const startDate = new Date(year, month - 1, 1);
	const endDate = new Date(year, month, 0, 23, 59, 59, 999);
	
	const monthTransactions = mockTransactions.filter(t => {
		return t.transactionDate >= startDate && t.transactionDate <= endDate && t.type === 'expense';
	});
	
	const categoryTotals: Record<string, { amount: number; label: string }> = {};
	monthTransactions.forEach(t => {
		const categoryKey = t.category?.label || 'Other';
		if (!categoryTotals[categoryKey]) {
			categoryTotals[categoryKey] = { amount: 0, label: categoryKey };
		}
		categoryTotals[categoryKey].amount += parseFloat(t.amount);
	});
	
	const sortedCategories = Object.keys(categoryTotals)
		.map(key => categoryTotals[key])
		.sort((a, b) => b.amount - a.amount)
		.slice(0, limit);
	
	return sortedCategories;
}
