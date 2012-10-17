/***********************************
*
*  Griddle
*  Copyright Healthx 2012, MIT License http://healthx.mit-license.org
*
***********************************/


var griddle = {
		initialized: false,
    	container: $("<code id='holder'></code>").append("<div class='container_12' >\n</div>"),
		between: function(x, val, range) {
			var min = val - range,
					max = val + range;
			return x >= min && x <= max;
			
		},
		init: function (data, location) {
				var griddleSelector = '#griddleContainer' + location + ' ';

				$(griddleSelector + ".ag1").sortable();

				$(griddleSelector + ".activeGrid").droppable({
						accept: ".sortableregion .moveable",
						drop: function (e, u) {
								$(u.draggable)
										.moveable({ ciLocation: location })
										.removeData("locationId")
										.appendTo(".activeGrid");
						}

				});
				//TODO: unify the markup updates
				$("#output").text(griddle.container.html());

				var gridColumns = 1;
				for (var i = 0; i < data.length; i++) {
						var loc = data[i].Location,
								className = "",
								gridClass = data[i].GridCssClass;

						if (gridClass !== null) {
								var grid = gridClass.split(" ");
								for (var j = 0; j < grid.length; j++) {
										if (grid[j].indexOf("_") > -1) {
												gridColumns += parseInt(grid[j].split("_")[1], 10);
												if (grid[j].indexOf("grid") > -1) {
														className = grid[j].split("_")[1];
												}
										}
								}
						} else {
								gridClass = "";
								className = "1";
						}

						var $del = $("<span class='deleteme'>X</span>")
												.bind("click", function () {
														var url = "",
																conf = window.confirm("Are you sure you wish to delete this item?");
														if (conf) {
																var moveables = $(this).parent().children(".sortableregion").children(".moveable");
																if (moveables.length) {
																		moveables.each(function () {
																				$(this).remove();
																		});
																}
																	 
																$(this).parent().remove();
																griddle.setMessage("info", "Content Item Removed", location);
														}
														return false;
												});

						if (loc >= 100) {
								$tgt = $(griddleSelector + ".region" + loc);
								$("<div class='moveable' id='" + regid + "' >" + nm + "</div>")
												.moveable({ ciLocation: location })
												.data("locationId", loc)
												.width("94%")
										.appendTo($tgt.children(".sortableregion"));

						} else if (loc == location) {
								$("<div class='" + gridClass + "' ></div>")
										.append($("<div class='moveable' id='" + regid + "'>" + nm + "</div>")
												.moveable({ ciLocation: location })
												.data("gridClass", parseInt(className, 10))
												.width("100%"))
										.appendTo(griddleSelector + ".activeGrid");
						}


				}

				var rows = Math.floor(gridColumns / 12) + (gridColumns % 12 > 0 ? 1 : 0);
				rows = isNaN(rows) ? 1 : rows;
				griddleRows = rows;
				for (var i = 0; i < rows; i++) {
						var rw = i === rows ? "<div class='grid_12 r" + (i + 1) + "'><span class='addme'>+</span></div>" : "<div class='grid_12 r" + (i + 1) + "'></div>";

				}

				$(griddleSelector + ".moveable").each(function () {
						var $el = $(this),
								$data = $el.data(),
								w = $data.w;

						$el.width(w);
						$el.css("margin-left", "0");

				});

				$(griddleSelector + '.appendRow').unbind('click');
				$(griddleSelector + '.appendRow')
				.attr("title", "Add a row to the grid")
				.click(function (e) {
						griddleRows++;
						$(griddleSelector + ".passGrid").append("<div class='grid_12 r" + griddleRows + "'></div>");
						return false;
				});
				
		},
		getRowId: function (t, location) {
				var griddleSelector = '#griddleContainer' + location + ' ';

				for (var i = 1; i <= griddleRows; i++) {
						if (griddle.between(t, $(griddleSelector + ".r" + i).offset().top, 5)) {
								return i;
						}
				}
				return -1;
		},
		getColumnStart: function (l) {
				if (griddle.between(l, 1, 2)) {
						return 1;
				} else if (griddle.between(l, 9.333, 2)) {
						return 2;
				} else if (griddle.between(l, 17.666, 2)) {
						return 3;
				} else if (griddle.between(l, 26, 2)) {
						return 4;
				} else if (griddle.between(l, 34.333, 2)) {
						return 5;
				} else if (griddle.between(l, 42.666, 2)) {
						return 6;
				} else if (griddle.between(l, 51, 2)) {
						return 7;
				} else if (griddle.between(l, 59.333, 2)) {
						return 8;
				} else if (griddle.between(l, 67.666, 2)) {
						return 9;
				} else if (griddle.between(l, 76, 2)) {
						return 10;
				} else if (griddle.between(l, 84.333, 2)) {
						return 11;
				} else if (griddle.between(l, 92.666, 2)) {
						return 12;
				} else {
						return -1;
				}
		},
		setMessage: function (state, message, location) {
				var griddleSelector = '#griddleContainer' + location + ' ';

				if (state === "error") {
						$(griddleSelector + ".uxGriddleMessage").html(message).show();
				} else if (state === "info") {
						$(griddleSelector + ".uxGriddleMessage").html(message).show().fadeOut(3000);
				} else {
						$(griddleSelector + ".uxGriddleMessage").html("").show();
				}
		},
		validateLayout: function () {
				var location = "100",
					griddleSelector = '#griddleContainer' + location + ' ',
					movArr = [],
					currRow = 0,
					contRow = 0,
					colCnt = 0;

				griddle.setMessage("clear", "", location);
				$(griddleSelector + ".moveable" ).each($.proxy(function (index, element) {
						$this = $(element);
						$data = $(element).data();
						var leftPct = (($this.offset().left - $(griddleSelector + ".activeGrid").offset().left) / $(griddleSelector + ".activeGrid").width()) * 100;
						$data.startCol = griddle.getColumnStart(leftPct);
						$data.rowId = griddle.getRowId($this.offset().top, location);
						movArr.push($this);
						if ($data.startCol === -1) {
								var msg = "Oops, there was something wrong with that move. Please check alignments and try again.";
								griddle.setMessage("error", msg, location);
								return false;
						}
				}, this));
				console.log(movArr);
				movArr.sort(function (a, b) {
						//0 if eq , -1 if b > a, 1 if b < a
						var result = 0;
						result = a.data("rowId") < b.data("rowId") ? -1 : (a.data("rowId") === b.data("rowId")) ? 0 : 1;
						//if on same row
						if (result === 0) {
								//Check the column order
								result = a.data("startCol") < b.data("startCol") ? -1 : 1;
						}
						return result;
				});
				//$("#output").text(griddle.container.html());
				var outputDivs = "\n";
				var updateSpec = function (movArr) {
						var i = 0;

						var itmRow = parseInt(movArr[i].data("rowId"), 10),
								itmCol = parseInt(movArr[i].data("startCol"), 10),
								itmSz = parseInt(movArr[i].data("gridClass"), 10),
								nxtRow = (movArr[i + 1] != null) ? movArr[i + 1].data("rowId") : -1,
								nxtCol = (movArr[i + 1] != null) ? movArr[i + 1].data("startCol") : -1,
								$data = movArr[i].data(),
								isContainer = false;
						
						
						if (nxtCol > -1 && nxtCol === itmCol && itmRow === nxtRow) {
								for (var k = 0, kk = movArr.length; k < kk; k++) {
										if (movArr[k].data("startCol") > itmCol) {
												nxtCol = movArr[k].data("startCol");
												break;
										}
								}
						}
						$data.suffix = $data.prefix = $data.alpha = undefined;
						if (currRow !== itmRow ) {
								
							currRow = itmRow;
							contRow = isContainer ? itmRow : contRow;
							colCnt = 0;
							//First
							$data.alpha = true;
							if (itmCol !== 1) {
									$data.prefix = itmCol - 1;
							}
							if (nxtRow === itmRow && nxtCol !== itmCol) {
									$data.suffix = nxtCol - (itmSz + itmCol);
							}
					
						} else {
								if (nxtRow === itmRow && nxtCol !== itmCol) {
										$data.suffix = nxtCol - (itmSz + itmCol);
								} else {
										$data.suffix = 0; //reset
								}
						}

						if (!$data.locationId) {
								colCnt = colCnt + itmSz;
								colCnt += ($data.suffix != undefined) ? $data.suffix : 0;
								colCnt += ($data.prefix != undefined) ? $data.prefix : 0;
						}
						if (nxtRow > itmRow || nxtRow === -1) {
								$data.suffix = 12 - colCnt;
						}
						var gridClassName = "grid_" + $data.gridClass;
						gridClassName += ($data.suffix != undefined && $data.suffix != 0) ? " suffix_" + $data.suffix : "";
						gridClassName += ($data.prefix != undefined && $data.prefix != 0) ? " prefix_" + $data.prefix : "";

						if ($data.locationId) {
								gridClassName = "";
								$data.suffix = $data.prefix = undefined;
						}
						if ($data.alpha) {
								gridClassName += " alpha";
						}

						outputDivs += "<div class='" + gridClassName + "'></div>\n";
				

						if ($data.suffix < 0 || $data.prefix < 0) {
							griddle.setMessage("error", "Oops, there was something wrong with that move. Please check alignments and try again.", location);
						} else {
							movArr.splice(0, 1);
							if (movArr.length > 0) {
								updateSpec(movArr);
							}
						}
				};
				if (movArr.length > 0) {
						updateSpec(movArr);
				}
				griddle.container.children(".container_12").empty();
				griddle.container.children(".container_12").append(outputDivs);
				$("#output").text(griddle.container.html());
				prettyPrint();
		}
};

    //override jquery ui resizable here to remove the absolute positioning logic
    $.widget("ui.resizable", $.ui.resizable, {
        _mouseStart: function (event) {

            var o = this.options, iniPos = this.element.position(), el = this.element;

            this.resizing = true;
            this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

            //This bugfix causes strange things to happen to the griddle, I'm extending the resizable widget to fix
            // bugfix for http://dev.jquery.com/ticket/1749
            //if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
            //  el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
            //}

            //Opera fixing relative position
            if ($.browser.opera && (/relative/).test(el.css('position')))
                el.css({ position: 'relative', top: 'auto', left: 'auto' });

            this._renderProxy();

            var num = function (v) {
                return parseInt(v, 10) || 0;
            };

            var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

            if (o.containment) {
                curleft += $(o.containment).scrollLeft() || 0;
                curtop += $(o.containment).scrollTop() || 0;
            }

            //Store needed variables
            this.offset = this.helper.offset();
            this.position = { left: curleft, top: curtop };
            this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight()} : { width: el.width(), height: el.height() };
            this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight()} : { width: el.width(), height: el.height() };
            this.originalPosition = { left: curleft, top: curtop };
            this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
            this.originalMousePosition = { left: event.pageX, top: event.pageY };

            //Aspect Ratio
            this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

            var cursor = $('.ui-resizable-' + this.axis).css('cursor');
            $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

            el.addClass("ui-resizable-resizing");
            this._propagate("start", event);
            return true;
        }
    });

//}
$.widget("hx.moveable", {
    options: {
        handles: "e",
        isDroppable: false,
        ciLocation: 0
    },
    _create: function () {
        var self = this,
        w = $(".sizeRef").width();
        $el = this.element;
        $el
        .data("gridClass", self.options.isDroppable ? 6 : 3)
        .draggable({
            connectToSortable: ".moveable .contentregion",
            snap: ".grid_1, .grid_12 .contentregion",
            snapMode: "inner",
            snapTolerance: 50,
            grid: [1, 55],
            stop: function (e, u) {
                griddle.setMessage("clear", "", self.options.ciLocation);
                griddle.validateLayout();
            }
        })
        .resizable({
            grid: [1, 55],
            helper: 'ui-state-highlight',
            handles: self.options.handles
        });

        if (self.options.isDroppable) {
            $el.children(".sortableregion").sortable({
                placeholder: 'ui-sortable-placeholder',
                forcePlaceholderSize: true
            });
            $el.droppable({
                accept: ".moveable",
                hoverClass: "ui-state-hover",
                drop: function (e, u) {
                    var $srcEl = $(u.draggable),
                        cln = $srcEl.clone(true),
                        $tgt = $(e.target),
                        childs,
                        childsH = 0,
                        rowId = -1,
                        locId = self.options.ciLocation;
                    cln.css("left", "0").css("top", "0").css("position", "relative").width("94%");
                    locId = $tgt.attr("id").split("ContentItemContainer")[1];

                    cln.data("locationId", locId);
                    $tgt.children(".sortableregion").append(cln);
                    $srcEl.remove();

                    childs = $tgt.children().children(".moveable");
                    cln.data("sortorder", childs.length);
                    $tgt.children(".sortableinfo").remove();

                    childs.each(function () {
                        childsH += $(this).height() + ($(this).height() * 0.01);
                    });
                    childsH += 15;
                    $tgt.css("height", childsH + "px");
                    rowId = griddle.getRowId($tgt.offset().top, locId);
                    $(".r" + rowId).css("height", childsH + "px");

                }
            });
        }

        //This overrides the jQuery UI Resizable grid snapping
        $.ui.plugin.add("resizable", "grid", {

            resize: function (event, ui) {
                var self = $(this).data("resizable"), o = self.options, cs = self.size, os = self.originalSize, op = self.originalPosition, a = self.axis, ratio = o._aspectRatio || event.shiftKey, data = $(this).data();
                o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
                var gutter = $(".activeGrid").width() * 0.01;
                var ox = Math.round((cs.width - os.width) / (o.grid[0] || 1)) * (o.grid[0] || 1), oy = Math.round((cs.height - os.height) / (o.grid[1] || 1)) * (o.grid[1] || 1);
                var agW = $(".activeGrid").width();
                var calcNewX = function (val) {
                    return agW * (val / 100);
                };
                var pct = 100 * ((os.width + ox) / agW);

                var newX;
                //check within bounds of our responsive grid*/
                //[ 6.333,14.666,23,31.333,39.666,48,56.333,64.666,73,81.333,89.666,98 ]
                if (pct < 10.4995) {
                    newX = calcNewX(6.333);
                    data.gridClass = 1;
                } else if (pct < 18.8325) {
                    newX = calcNewX(14.666);
                    data.gridClass = 2;
                } else if (pct < 27.1665) {
                    newX = calcNewX(23);
                    data.gridClass = 3;
                } else if (pct < 35.4995) {
                    newX = calcNewX(31.333);
                    data.gridClass = 4;
                } else if (pct < 43.8325) {
                    newX = calcNewX(39.666);
                    data.gridClass = 5;
                } else if (pct < 52.1665) {
                    newX = calcNewX(48);
                    data.gridClass = 6;
                } else if (pct < 60.4995) {
                    newX = calcNewX(56.333);
                    data.gridClass = 7;
                } else if (pct < 68.8325) {
                    newX = calcNewX(64.666);
                    data.gridClass = 8;
                } else if (pct < 77.1665) {
                    newX = calcNewX(73);
                    data.gridClass = 9;
                } else if (pct < 85.4995) {
                    newX = calcNewX(81.333);
                    data.gridClass = 10;
                } else if (pct < 91.8325) {
                    newX = calcNewX(89.666);
                    data.gridClass = 11;
                } else { // pct > 91.8325
                    newX = calcNewX(98);
                    data.gridClass = 12;
                }

                self.size.width = newX;
                self.size.height = os.height + oy;
                //set children of content regions to the correct width!
                $(this).children(".sortableregion").children(".moveable").width("96%");
                griddle.validateLayout();

            }

        });
       // end custom resize griddle


    },
    destroy: function () {
        $.Widget.prototype.destroy.call(this);
    }
});
$.widget.bridge("moveable", $.hx.moveable);

        $(document).on("click", ".addItem", function () {
           
            var $itm = $("<div class='moveable' >" + "Item" + "</div>")
                .moveable({ ciLocation: 0 })
                .data("ciid", "0")
                .appendTo(".activeGrid");

            var $del = $("<span class='deleteme'>X</span>")
                                .bind("click", function () {
                                    var url = "",
                                        data = { registryid: $(this).parent().data("regid") },
                                        conf = window.confirm("Are you sure you wish to delete this item?");
                                    if (conf) {
                                        if ($(this).parent().data("regid")) {
                                           
                                        } else {
                                            $(this).parent().remove();
                                            griddle.setMessage("info", "Item Removed", self.options.ciLocation);
                                        }
                                    }
                                    return false;
                                });
            $itm.prepend($del);

            griddleRows++;
            $(".passGrid").append("<div class='grid_12 r" + griddleRows + "'></div>");
            griddle.validateLayout();
        });



    $(document).ready(function () {
        if (top !== self) {
            $(".griddle").css("min-height", "500px");
        }

        var url = "";
        griddle.init(0,"100");
    });


