define(function (){
    'use strict';

    var MAX_OBJECTS = 10;
    var MAX_LEVELS = 5;

    var QuadTree = function(bounds, level) {

        this.bounds = bounds || {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.objects = [];
        this.nodes = [];
        this.level = level || 0;
    };

    extend.call(QuadTree.prototype, {

        /*
         * Clears the quadTree and all nodes of objects
         */
        clear : function() {
            this.objects = [];
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].clear();
            }
            this.nodes = [];
        },

        /*
         * Get all objects in the quadTree
         */
        getAllObjects : function(returnedObjects) {
            var i, len;
            for (i = 0, len = this.nodes.length; i < len; i++) {
                this.nodes[i].getAllObjects(returnedObjects);
            }
            for (i = 0, len = this.objects.length; i < len; i++) {
                returnedObjects.push(this.objects[i]);
            }
            return returnedObjects;
        },

        findObjects : function(returnedObjects, obj) {
            if (!obj) return;

            var index = this.getIndex(obj);
            if (index != -1 && this.nodes.length) {
                this.nodes[index].findObjects(returnedObjects, obj);
            }
            for (var i = 0, len = this.objects.length; i < len; i++) {
                returnedObjects.push(this.objects[i]);
            }
            return returnedObjects;
        },

        /*
         * Insert the object into the quadTree. If the tree
         * excedes the capacity, it will split and add all
         * objects to their corresponding nodes.
         */
        insert : function(obj) {

            var i, len, index;

            if (!obj) return;

            if (obj instanceof Array) {
                for (i = 0, len = obj.length; i < len; i++) {
                    this.insert(obj[i]);
                }
                return;
            }

            if (this.nodes.length) {
                // Only add the object to a subnode if it can fit completely within one
                if (index = this.getIndex(obj) >= 0) {
                    this.nodes[index].insert(obj);
                    return;
                }
            }

            this.objects.push(obj);
            // Prevent infinite splitting
            if (this.objects.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
                if (!this.nodes[0]) {
                    this.split();
                }
                i = 0;
                while (i < this.objects.length) {
                    if (index = this.getIndex(this.objects[i]) >= 0){
                        this.nodes[index].insert((this.objects.splice(i,1))[0]);
                    }else {
                        i++;
                    }
                }
            }
        },

        /*
         * Determine which node the object belongs to. -1 means
         * object cannot completely fit within a node and is part
         * of the current node
         */
        getIndex : function(obj) {
            var index = -1;
            var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
            var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

            var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
            var bottomQuadrant = (obj.y > horizontalMidpoint);

            if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
                if (topQuadrant) {
                    index = 1;
                }else if (bottomQuadrant) {
                    index = 2;
                }
            }
            else if (obj.x > verticalMidpoint) {
                if (topQuadrant) {
                    index = 0;
                } else if (bottomQuadrant) {
                    index = 3;
                }
            }

            return index;
        },

        /*
         * Splits the node into 4 subnodes
         */
        split : function() {
            // Bitwise or [html5rocks]
            var subWidth = (this.bounds.width / 2) | 0;
            var subHeight = (this.bounds.height / 2) | 0;
            var level = this.level;

            this.nodes[0] = new QuadTree({
                x: this.bounds.x + subWidth,
                y: this.bounds.y,
                width: subWidth,
                height: subHeight
            }, level+1);
            this.nodes[1] = new QuadTree({
                x: this.bounds.x,
                y: this.bounds.y,
                width: subWidth,
                height: subHeight
            }, level+1);
            this.nodes[2] = new QuadTree({
                x: this.bounds.x,
                y: this.bounds.y + subHeight,
                width: subWidth,
                height: subHeight
            }, level+1);
            this.nodes[3] = new QuadTree({
                x: this.bounds.x + subWidth,
                y: this.bounds.y + subHeight,
                width: subWidth,
                height: subHeight
            }, level+1);
        }

    });

});