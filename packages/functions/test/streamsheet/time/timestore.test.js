const { sleep } = require('@cedalo/commons');
const { FunctionErrors } = require('@cedalo/error-codes');
const { createCellAt } = require('../../utilities');
const { newMachine, newSheet, runMachine } = require('./utils');

const ERROR = FunctionErrors.code;

describe('time.store', () => {
	it('should store values over specified time', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1))' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		expect(term._timestore.size).toBe(1);
		expect(term._timestore.values('v1')).toEqual([2]);
		await machine.step();
		await machine.step();
		expect(term._timestore.size).toBe(3);
		expect(term._timestore.values('v1')).toEqual([2, 3, 4]);
	});
	it('should support period parameter', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),1/1000)' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		expect(term._timestore.size).toBe(1);
		expect(term._timestore.values('v1')).toEqual([2]);
		await sleep(10);
		await machine.step();
		await sleep(10);
		await machine.step();
		expect(term._timestore.size).toBe(1);
		expect(term._timestore.values('v1')).toEqual([4]);
	});
	it('should support limit parameter', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,,1)' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		expect(term._timestore.size).toBe(1);
		expect(term._timestore.values('v1')).toEqual([2]);
		await machine.step();
		await machine.step();
		expect(term._timestore.size).toBe(1);
		expect(term._timestore.values('v1')).toEqual([4]);
	});
	it('should support timestamp parameter', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,B1)' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		expect(term._timestore.timestamps()).toEqual([2]);
		await machine.step();
		await machine.step();
		expect(term._timestore.timestamps()).toEqual([2, 3, 4]);
	});
	it('should sort entries by timestamp', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('C1', { formula: '100-B1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,C1)' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		expect(term._timestore.timestamps()).toEqual([98]);
		await machine.step();
		await machine.step();
		expect(term._timestore.timestamps()).toEqual([96, 97, 98]);
	});
	test('if timestamp is same last added comes after existing entry', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('C1', { formula: 'C1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,C1)' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		await machine.step();
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, 3, 4]);
		expect(term._timestore.timestamps()).toEqual([2, 3, 4]);
		// now add values with same timestamp:
		createCellAt('C1', 4, sheet);
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, 3, 4, 5]);
		expect(term._timestore.timestamps()).toEqual([2, 3, 4, 4]);
		createCellAt('C1', 2, sheet);
		await machine.step();
		createCellAt('C1', 3, sheet);
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, 6, 3, 7, 4, 5]);
		expect(term._timestore.timestamps()).toEqual([2, 2, 3, 3, 4, 4]);
	});
	it('should be allowed to add values with undefined values!!', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1))' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		createCellAt('B1', undefined, sheet);
		await machine.step();
		await machine.step();
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		await machine.step();
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, undefined, undefined, 2, 3]);
	});
	it('should support multiple values', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('A2', 'v2', sheet);
		createCellAt('A3', 'v3', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('B2', { formula: 'B2+10' }, sheet);
		createCellAt('B3', { formula: 'B3+100' }, sheet);
		createCellAt('A5', { formula: 'time.store(JSON(A1:B3))' }, sheet);
		const cell = sheet.cellAt('A5');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		await machine.step();
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, 3, 4]);
		expect(term._timestore.values('v2')).toEqual([20, 30, 40]);
		expect(term._timestore.values('v3')).toEqual([200, 300, 400]);
	});
	it('should ignore values without a key', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('A3', 'v3', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('B2', { formula: 'B2+10' }, sheet);
		createCellAt('B3', { formula: 'B3+100' }, sheet);
		createCellAt('A5', { formula: 'time.store(JSON(A1:B4))' }, sheet);
		const cell = sheet.cellAt('A5');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		await machine.step();
		await machine.step();
		expect(term._timestore.values('v1')).toEqual([2, 3, 4]);
		expect(term._timestore.values('v2')).toEqual([]);
		expect(term._timestore.values('v3')).toEqual([200, 300, 400]);
	});
	it('should reset store on machine start', async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1))' }, sheet);
		const cell = sheet.cellAt('A3');
		const term = cell.term;
		expect(cell.value).toBe(true);
		await machine.step();
		await machine.step();
		await machine.step();
		expect(term._timestore.size).toBe(3);
		await runMachine(machine, 50);
		// one is stored on machine start...
		expect(term._timestore.size).toBe(1);
	});
	it(`should return error ${ERROR.ARGS} if required parameter is missing`, () => {
		const sheet = newSheet();
		createCellAt('A3', { formula: 'time.store()' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.ARGS);
		createCellAt('A3', { formula: 'time.store(,)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.ARGS);
		createCellAt('A3', { formula: 'time.store(,,)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.ARGS);
		createCellAt('A3', { formula: 'time.store(,,,)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.ARGS);
	});
	it(`should return error ${ERROR.VALUE} if limit is below 1`, async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,,0)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.VALUE);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,,-1)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.VALUE);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,,-123456)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(ERROR.VALUE);
	});
	it(`should return ${ERROR.LIMIT} if limit is reached`, async () => {
		const machine = newMachine({ cycletime: 1000 });
		const sheet = machine.getStreamSheetByName('T1').sheet;
		createCellAt('A1', 'v1', sheet);
		createCellAt('B1', { formula: 'B1+1' }, sheet);
		createCellAt('A3', { formula: 'time.store(JSON(A1:B1),,,2)' }, sheet);
		expect(sheet.cellAt('A3').value).toBe(true);
		await machine.step();
		expect(sheet.cellAt('A3').value).toBe(true);
		await machine.step();
		expect(sheet.cellAt('A3').value).toBe(true);
		await machine.step();
		expect(sheet.cellAt('A3').value).toBe(ERROR.LIMIT);
	});
});
