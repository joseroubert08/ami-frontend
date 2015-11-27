/**************

Copyright 2016 Open Effect

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

***************/

'use strict';
AMIApp.controller('IndustryCtrl', ['$scope', '$timeout', '$location', '$window', 'NavCollection', 'industries', 'AMIRequest', 'dataProviderService', 'urls', function ($scope, $timeout, $location, $window, NavCollection, industries, AMIRequest, dataProviderService, urls) {
    $scope.jurisdiction = AMIRequest.get('jurisdiction');
    $window.scrollTo(0,0)
    $scope.previous = function(){
      $location.path('/');
    }
    $scope.nextIsLoading = false;
    // $scope.companies = companies;
    $scope.industries = industries;
    
    if(AMIRequest.has('industry')){
      $scope.industry = AMIRequest.get('industry');
      $scope.isIndustrySelected = true;
    }

    $scope.$watch('industry', function(oldIndustry, newIndustry){
      if($scope.industry && $scope.industry.id){
        AMIRequest.set('industry', $scope.industry);
        AMIRequest.markAsComplete('industry');
        $scope.isIndustrySelected = true;
        //NavCollection.unRestrict('operator');
      }
      else{
        AMIRequest.drop('industry');
        $scope.isIndustrySelected = false;
        //NavCollection.restrict('operator');
      }
    })
    $scope.$watch(function() {
      var jurisdiction;
      $scope.nextStage = NavCollection.nextItem();
      jurisdiction = AMIRequest.get('jurisdiction');
      if($scope.jurisdiction !== jurisdiction){
        $scope.jurisdiction = jurisdiction;
        dataProviderService.getItem(urls.apiURL, "/jurisdictions/" + jurisdiction.id + "/industries")
        .then(function(industries){
          $scope.industries = industries;
          $scope.industry = {};
          AMIRequest.drop('industry');
        });
      }
    });
  }]);