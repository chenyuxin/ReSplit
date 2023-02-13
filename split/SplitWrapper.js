import React,{useState,useRef} from 'react';
import SplitLine from './SplitLine';

/**
 * 移动分隔页面
 * @author chenyuxin2022
 * @param hideSplit 是否隐藏分割条,可选
 * @param {Array<Number>} colsWidth 竖分割条初始位置,从组件开始计算,依次竖向距离,不填则不竖分割
 * @param {Array<Number> | Number} rowHeight 行高度,单个数字每行等高,数组可规定每行高,不填则根据每个子组件的自动行高度
 * @param {Number} splitWidth 分割条宽度,可选
 * @param {String} splitColor 分割条颜色,可选
 * @use <SplitWrapper style={{outlineStyle:'solid'}} hideSplit colsWidth={[350]} rowHeight={100} splitWidth={4} splitColor='#1976d2' > {children} </SplitWrapper>
 * @returns 
 */
const SplitWrapper = (props) => {
    
    const splitRef = useRef();
    // console.log('组件宽度：',splitRef.current.offsetWidth);

    /**
     * 分割条厚度
     */
    const splitWidth = props.splitWidth ? props.splitWidth : 4;
    
    /**
     * 竖分割列宽数组参数
     */
    const [colSize,setColSize] = useState( props.colsWidth ? [].concat(props.colsWidth) : []);
    const updateColsWidth = (e,index)=>{
        if ( //判断分割线的移动范围 
            ( colSize[index] + e.movementX > splitWidth) //前div宽度比分割线宽可以移动
            && ( !colSize[index+1] || colSize[index+1] - e.movementX > splitWidth ) //后div宽度比分割线宽可以移动,最后一个自动尺寸div除外
        ) {
            setColSize(colSize =>{
                const newColSize = [...colSize];
                newColSize[index] += e.movementX;
                if ( newColSize[index+1] ) {//调整的不是最后一个分割线
                    newColSize[index+1] -= e.movementX;//分割线后面的div也要变化
                } else {//调整的是最后一个分割线
                    const sumColSize = newColSize.reduce((preValue,currValue)=> preValue+currValue);
                    if (sumColSize + splitWidth > splitRef.current.offsetWidth) {//调整后的尺寸超过了当前组件的总宽度，不做改变
                        return colSize;
                    }
                }
                return newColSize;
            });
        }

    }

    /**
     * 横分割线数组参数
     */
    const [rowSize,setRowSize] = useState(() => {
        /**
         * 分割行的数量
         */
        const rowNums = Math.ceil(props.children.length/(colSize.length+1));
        // console.log('分割行的数量:',rowNums);

        let rowHeight;
        if ( typeof(props.rowHeight) === 'number') {
            rowHeight = new Array(rowNums);
            rowHeight.fill(props.rowHeight);
            // console.log('number rowHeight:',rowHeight);
        } else if ( props.rowHeight instanceof Array) {
            rowHeight = [...props.rowHeight];
            if (rowHeight.length > rowNums) {
                rowHeight = rowHeight.splice(0,rowNums);
            } else if  (rowHeight.length < rowNums) {
                const fillArray = new Array(rowNums-rowHeight.length);
                fillArray.fill(rowHeight[0]);
                rowHeight = rowHeight.concat(fillArray);//如果行数组不够，用第一行行高补全后面行
            }
        } else if ( typeof(props.rowHeight) === 'undefined') {
            rowHeight = [];
        }
        return rowHeight;
    });
    const updateRowHeight = (e,index)=>{
        if (//判断分割线的移动范围 
            ( rowSize[index] + e.movementY > splitWidth) //上div比分割线高可以移动
            && ( !rowSize[index+1] || rowSize[index+1] - e.movementY > splitWidth ) //下div宽度比分割线宽可以移动,最后一个自动尺寸div除外
        ) {
            setRowSize(rowSize => {
                const newRowSize = [...rowSize];
                newRowSize[index] += e.movementY;
                if (newRowSize[index+1]) {//调整的不是最后一个分割线
                    newRowSize[index+1] -= e.movementY;
                } else {//调整的是最后一个分割线
                    const sumRowSize = newRowSize.reduce((preValue,currValue)=> preValue+currValue);
                    if ( sumRowSize + splitWidth > splitRef.current.offsetHeight) {//调整后的尺寸超过了当前组件的总高度，不做改变
                        return rowSize;
                    }
                }
                return newRowSize;    
            });
        }
    }

    /**
     * 设置分割条的定位
     * @param {Number} splitIndex 分割条索引
     * @param {Boolean} isRowSplit 是横分割条
     * @returns 
     */
    const setSplitPosition = (splitIndex,isRowSplit) => {
        let positionNum = 0;
        for (let i=0;i<=splitIndex;i++) {
            positionNum += isRowSplit ? rowSize[i] : colSize[i];
        }
        return positionNum-splitWidth;
    }

    /**
     * 区别返回每一分割框内的div样式
     * @param {int} index div框的顺序索引
     * @returns 
     */
    const divStyle = (index)=>{
        const divStyle = {overflow:'hidden'};
        
        const colIndex = index % (colSize.length + 1);//第几列
        if ( colIndex === colSize.length ) {
            //最后一列什么都不做nothing to do
        } else if ( colIndex === 0 ) {
            divStyle.float = 'left'; 
            divStyle.width = colSize[colIndex];
            divStyle.clear = 'left';//第一列需要新的一行占位
        } else {
            divStyle.float = 'left'; 
            divStyle.width = colSize[colIndex];
        }

        if (props.rowHeight) {
            const rowIndex = Math.floor(index / (colSize.length + 1));
            divStyle.height = rowSize[rowIndex];
        }

        return divStyle;
    }

    return (
        <div ref={splitRef} style={{...props.style, position:'relative',padding:0}} >
            {props.children.map( (child,index) => (
                <div key={index} style={divStyle(index)}>{child}</div>
            ))}
            
            {/* 渲染竖分割条 */}
            {colSize.map( (colWidth,splitIndex) => (
                <SplitLine key={splitIndex} splitIndex={splitIndex} splitWidth={splitWidth} splitColor={props.splitColor}  hideSplit={props.hideSplit}
                    setSplitPosition={setSplitPosition} updateSize={updateColsWidth} 
                />
            ))}

            {/* 渲染横分割条,rowSize表示的是行高,最后一行不添加横分割条 */}
            {rowSize.map( (rowHeight,splitIndex) => (
                rowSize.length-1 === splitIndex ? null :
                <SplitLine key={splitIndex} splitIndex={splitIndex}  splitWidth={splitWidth} splitColor={props.splitColor} hideSplit={props.hideSplit}
                    setSplitPosition={setSplitPosition} updateSize={updateRowHeight} 
                    isRowSplit 
                />
            ))}
            
            <div style={{clear:'both'}} /> {/* 放在最后最后一行高度正确占用*/}
        </div>
    )    

};

export default SplitWrapper;

/** 
 //测试样例
<SplitWrapper style={{outlineStyle:'solid'}}  colsWidth={[150,150]} rowHeight={80} >
    <Box style={{backgroundColor:'yellow',height:'100%'}} >
        <div>a1</div>
        <div>b1</div>
    </Box>

    <div style={{backgroundColor:'red'}} >
        <div>a2</div>
        <div>b2</div>
        <div>c2</div>
        <div>d2</div>
    </div>

    <div style={{backgroundColor:'green'}} >
        <div>a3</div>
    </div>

    <div style={{backgroundColor:'blue'}} >
        <div>a4</div>
        <div>b4</div>
        <div>c4</div>
    </div>

    <div style={{backgroundColor:'orange'}} >
        <div>a5</div>
        <div>b5</div>
        <div>c5</div>
        <div>d5</div>
        <div>e5</div>
        <div>f5</div>
        <div>g5</div>
        <div>h5</div>
        <div>i5</div>
    </div>

    <div style={{backgroundColor:'purple'}} >
        <div>a6</div>
    </div>

    <div style={{backgroundColor:'pink'}} >
        <div>a7</div>
        <div>b7</div>
    </div>

    <div style={{backgroundColor:'yellowgreen'}} >
        <div>a8</div>
        <div>b8</div>
    </div>

    <div style={{backgroundColor:'brown'}} >
        <div>a9</div>
        <div>b9</div>
    </div>

</SplitWrapper>
 */