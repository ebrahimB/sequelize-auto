// put in seperate file to keep main sequelize-auto clean
'use strict';

var _ = require('lodash');

function doCase(word, caseType){
  if(typeof caseType !== "string"){
    return word;
  }
  caseType = !!caseType && caseType.toLowerCase();
  switch (caseType) {
    case "pascal":  
      const camel = _.camelCase(word);
      return camel && camel.charAt(0).toUpperCase() + camel.slice(1);
    case "camel":
      return _.camelCase(word);
    case "upper":    
      return word && word.toUpperCase();
    default:
      return word;
  }
}

exports.func = {
  doCase
};

function getModelFileStart(indentation, spaces, tableName) {
  var fileStart = "/* jshint indent: " + indentation + " */\n";
  fileStart += '// tslint:disable\n';
  fileStart += 'import * as sequelize from \'sequelize\';\n';
  fileStart += 'import {DataTypes} from \'sequelize\';\n';
  fileStart += 'import {' + tableName + 'Attribute} from \'./db\';\n\n';
  fileStart += "module.exports = function(sequelize: sequelize.Sequelize, dataTypes: typeof DataTypes) {\n";
  fileStart += spaces + 'return sequelize.define(\'' + tableName + '\', {\n';
  return fileStart;
}

function generateTableModels(tableNames, isSpaces, indentation, caseModelType, caseForFileType) {
  var spaces = '';
  for (var i = 0; i < indentation; ++i) {
    spaces += (isSpaces === true ? ' ' : "\t");
  }

  return generateImports() + generateInterface() + generateTableMapper();

  function generateImports() {
    var fileTextOutput = '// tslint:disable\n';
    fileTextOutput += 'import * as path from \'path\';\n';
    fileTextOutput += 'import * as sequelize from \'sequelize\';\n';
    fileTextOutput += 'import * as def from \'./db\';\n\n';
    return fileTextOutput;
  }

  function generateInterface() {
    var fileTextOutput = 'export interface ITables {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var table = doCase(tableNames[i], caseModelType);

      fileTextOutput += spaces + table + ': typeof def.' + table + 'Model;\n';
    }
    fileTextOutput += '}\n\n';
    return fileTextOutput;
  }

  function generateTableMapper() {
    var fileTextOutput = 'export const getModels = function(seq:sequelize.Sequelize):ITables {\n';
    fileTextOutput += spaces + 'const tables:ITables = {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var tableForClass = doCase(tableNames[i], caseModelType);
      var tableForFile = doCase(tableNames[i], caseForFileType);

      fileTextOutput += spaces + spaces + tableForClass + ': seq.import(path.join(__dirname, \'./' + tableForFile + '\')),\n';
    }
    fileTextOutput += spaces + '};\n';
    fileTextOutput += spaces + 'return tables;\n';
    fileTextOutput += '};\n';
    return fileTextOutput;
  }
}

exports.model = {
  getModelFileStart,
  generateTableModels
};

function getDefinitionFileStart() {
  return '// tslint:disable\nimport * as Sequelize from \'sequelize\';\n\n';
}

function getTableDefinition(tsTableDefAttr, tableName, attributeOnly) {
  var tableDef = '\n// table: ' + tableName + '\n';
  tableDef += tsTableDefAttr + '\n}\n';
  if(!attributeOnly){
    tableDef += 'export class ' + tableName + 'Model extends Sequelize.Model<' + tableName + 'Attribute> { }\n';
  }
  return tableDef;
}

// doing this in ts helper to not clutter up main index if statement
function getMemberDefinition(spaces, fieldName, val, allowNull) {
  if (fieldName === undefined) return '';
  var m = '\n' + spaces + fieldName + (allowNull === true ? '?:' : ':');

  if (val === undefined) {
    m += 'any';
  } else if (val.indexOf('dataTypes.BOOLEAN') > -1) {
    m += 'boolean';
  } else if (val.indexOf('dataTypes.INTEGER') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.TINYINT') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.SMALLINT') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.MEDIUMINT') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.BIGINT') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.STRING') > -1) {
    m += 'string';
  } else if (val.indexOf('dataTypes.CHAR') > -1) {
    m += 'string';
  } else if (val.indexOf('dataTypes.REAL') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.TEXT') > -1) {
    m += 'string';
  } else if (val.indexOf('dataTypes.DATE') > -1) {
    m += 'Date';
  } else if (val.indexOf('dataTypes.FLOAT') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.DECIMAL') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.DOUBLE') > -1) {
    m += 'number';
  } else if (val.indexOf('dataTypes.UUIDV4') > -1) {
    m += 'string';
  } else {
    m += 'any';
  }

  return m + ';';
}

exports.def = {
  getDefinitionFileStart,
  getTableDefinition,
  getMemberDefinition
};