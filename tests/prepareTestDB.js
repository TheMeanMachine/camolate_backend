"use strict";

const mysql = require("promise-mysql");
const testInfo = require("./config");


/**
 * Takes two objects and replaces obj1 values with obj2 if set
 * @param  {Object} obj1
 * @param  {Object} obj2
 * @return {Object} new object with overriden values
 */
const joinObjects = (obj1, obj2) => {
	const result = {};
	for(let key of Object.keys(obj1)) result[key] = obj2[key] || obj1[key];
	
	return result;
};
const setTestConfig = () => {
	const info = require("../config");
	const testInfoOverridden = joinObjects(info.database, testInfo.database);
	jest
		.doMock("../config", () => {
			return {database: testInfoOverridden};
		});
};

exports.prepareTestDatabase = async() => {
	
	setTestConfig();
	
	const info = require("../config");
	const connectionNoDB = await mysql.createConnection({host: info.database.host, user: info.database.user, password: info.database.password});
	const dropDatabase = "DROP DATABASE IF EXISTS `"+ info.database.database + "`";
	await connectionNoDB.query(dropDatabase);

	const createDatabase = "CREATE DATABASE IF NOT EXISTS `"+ info.database.database + "`";
	await connectionNoDB.query(createDatabase);

	connectionNoDB.end(); //Close the connection
	
	const database = require("../models/database/dbHandler-dao.js");//loaded after mock
	await database.createTables();
	const testData = require("../models/database/testData.js");//loaded after mock
	await testData.mockData();

	return;
	
};

exports.clear = () => {
	jest.resetAllMocks();
	jest.restoreAllMocks();//todo: change this to specific
};
