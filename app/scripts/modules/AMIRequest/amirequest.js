/**************

Copyright 2015 Open Effect

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

***************/

'use strict';
var AMIRequest = angular.module('AMIRequest', []);
AMIRequest.service("AMIRequest", function($rootScope, $location, NavCollection){
  var request = {};
  request.date = moment().format('MMMM Do, YYYY');
  request.get = function(key){
    if(this.has(key)){
      return this[key]['data'];
    }
    else{
      return null;
    }
  }
  request.isComplete = function(key){
    if(this.has(key)){
      return this[key].completed
    }
    else{
      return false;
    }
  }
  request.markAsComplete = function(key){
    if(this[key] && !this[key].completed){
      console.log("markingAsComplete");
      this[key].completed = true;
      this.resolveHierarchy(key, this[key]);
    }
  }
  request.set = function(key, value, isComplete){
    console.log(key, "set", value);
    var oldValue = null;
    var isChanged = true;
    if(typeof isComplete == "undefined"){
      isComplete = true;
    }
    if(this[key]){
      oldValue = this[key].data;
    }
    isChanged = (JSON.stringify(oldValue) !== JSON.stringify(value));

    if(isChanged){
      console.log("changed", isComplete);
      this[key] = {"data": value, "completed": isComplete}
    }
    if(this.hierarchy.indexOf(key) >= 0){
      this.resolveHierarchy(key, this[key], isChanged);
    }
  }
  request.drop = function(key){
    console.log("Dropping " + key + " from request");
    delete this[key];
    if(this.hierarchy.indexOf(key) >= 0){
      this.resolveHierarchy(key);
    }
  }
  request.has = function(key){
    return (typeof this[key] !== "undefined");
  }
  request.resolveHierarchy = function(key, value, isChanged){
    var index;

    if(typeof value == "undefined" || !value.completed){
      index = this.hierarchy.indexOf(key);
    }
    else{
      index = this.hierarchy.indexOf(key) + 1;
    }

    for (var i = 0; i < this.hierarchy.length; i++) {
      console.log(this.hierarchy[i]);
      if(i > index && isChanged){
        if(typeof this[this.hierarchy[i]] !== "undefined"){
          console.log("deleting", this.hierarchy[i]);
          delete this[this.hierarchy[i]];
        }
      }
      if(i <= index){
        try{
          console.log("unrestricting past items", this.hierarchy[i]);
          NavCollection.unRestrict(this.hierarchy[i]);
        }
        catch(e){
          continue;
        }
      }
      else{
        try{
          if(isChanged){
            console.log("\tDropping " + this.hierarchy[i] + " from request");
            NavCollection.restrict(this.hierarchy[i]);
            console.log("Restricting incomplete future items", this.hierarchy[i]);
          }
          else{
            if(this.has(this.hierarchy[i])){
              if(this.isComplete(this.hierarchy[i])){
                console.log("Unrestricting complete future item", this.hierarchy[i]);
                NavCollection.unRestrict(this.hierarchy[i]);
              }
              else{
                console.log("Restricting incomplete future items 2 ", this.hierarchy[i]);
                NavCollection.restrict(this.hierarchy[i]);
              }
            }
            else{
              console.log("Restricting incomplete future items 3", this.hierarchy[i]);
              NavCollection.restrict(this.hierarchy[i]);
            }
          }
        }
        catch(e){
          console.log(e);
          continue;
        }
      }
    }
  }
  request.hierarchy = ['jurisdiction', 'industry', 'operator', 'services', 'subject', 'request'];
  request.getAnon = function(){
    return {
      jurisdiction: this.jurisdiction.data,
      operator: this.operator.data,
      services: this.services.data,
      date: this.date.data
    }
  }
  return request;
});

var deepDiffMapper = function() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {type: this.compareValues(obj1, obj2), data: obj1 || obj2};
            }

            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isObject: function(obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();