var TypeScriptedOData;
(function (TypeScriptedOData) {
    var ODataQuery = (function () {
        function ODataQuery() {
            this.queryOptions = {};
        }
        ODataQuery.prototype.compileSubQueries = function (properties, subQueries) {
            var _this = this;
            if (properties.length != subQueries.length) {
                throw "There must be one subquery per entity, use null if no subquery is required";
            }
            this.queryOptions.$expand = "$expand=";
            properties.forEach(function (property, index) {
                if (index > 0) {
                    _this.queryOptions.$expand += ",";
                }
                _this.queryOptions.$expand += property;
                if (subQueries[index]) {
                    _this.queryOptions.$expand += "(" + subQueries[index].compile() + ")";
                }
            });
        };
        ODataQuery.prototype.select = function (properties, subQueries) {
            if (subQueries) {
                this.compileSubQueries(properties, subQueries);
            }
            else {
                this.queryOptions.$select = "$select=" + properties.join(",");
            }
            return this;
        };
        ODataQuery.prototype.expand = function (properties, subQueries) {
            if (subQueries) {
                this.compileSubQueries(properties, subQueries);
            }
            else {
                this.queryOptions.$expand = "$expand=" + properties.join(",");
            }
            return this;
        };
        ODataQuery.prototype.take = function (amount) {
            this.queryOptions.$top = "$top=" + amount;
            return this;
        };
        ODataQuery.prototype.count = function (includeCount) {
            if (includeCount === false) {
                this.queryOptions.$count = "$count=false";
            }
            else {
                this.queryOptions.$count = "$count=true";
            }
            return this;
        };
        ODataQuery.prototype.compile = function () {
            var queryString = "";
            if (this.queryOptions.$select) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$select;
            }
            if (this.queryOptions.$expand) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$expand;
            }
            if (this.queryOptions.$top) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$top;
            }
            if (this.queryOptions.$count) {
                queryString += this.queryOptions.$count;
            }
            return queryString;
        };
        return ODataQuery;
    })();
    TypeScriptedOData.ODataQuery = ODataQuery;
})(TypeScriptedOData || (TypeScriptedOData = {}));
