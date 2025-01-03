import { Component, OnInit, HostListener, Renderer2, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { ContentDataService } from '../content-data.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
// import { LineLocatorPipe } from './pipes/line-locator.pipe';
// import { LineLocatorPipe } from '../pipes/line-locator.pipe';
import { LineLocatorPipe } from '../line-locator.pipe';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  // template : `<div></div>`,
  styleUrls: ['./content-editor.component.css'],
  encapsulation: ViewEncapsulation.Emulated, 
})

export class ContentEditorComponent {

  // @Output() navigatetoselectedtopicChange = new EventEmitter<string>();
  showContentEditor = true;
  navigate = false;
    selectedSubtopic: any;
  // selectedTopic: any;
  whatsNewExpanded: any;
  whatsNewSubtopics: any;
  clickedCell: { rowIndex: number; column: string } | null = null;
  Contents: any;
  rowIndex: any;
  colIndex: any;
  currentRowIndex: number | null = null;
  currentColumnIndex: number | null = null;
  selectedRow: any = null;
  isViewMode = false;
  editingCell: { row: any; column: string } | null = null;
  textareaCells: Set<string> = new Set();
  contentData: any[] = [];
  columns: string[] = ['ID', 'Ordering', 'Type', 'Content', 'Image URL', 'Image Text', 'What`s New'];
  columnWidths: { [key: string]: string } = {
    'ID': '5%',
    'Ordering': '4%',
    'Type': '7%',
    'Content': '55%',
    'Image URL': '7%',
    'Image Text': '7%',
    'What`s New': '8%'
  };
  dropdownOptions: string[] = ['Topic', 'Para', 'List', 'UList', 'IPara', 'Subtopic'];
  errorMessage: string = '';
  isManualView: boolean = false;
  currentPage = 0;
  groupedContentData = [];
  selectedTopicId: number | null = null;
  selectedSubtopicId: number | null = null;
  renderedContent: any;
  isTopicView: boolean = false;
  isUserManualVisible: boolean = false;
  filterText: any;
  showContent: boolean = false;
  searchInput: any;
  searchtopicCID: any;
resetStateAndLoadContent: any;
  // highlightside: boolean;


  constructor(
    private contentDataService: ContentDataService,
    private renderer: Renderer2,
    private router: Router,
    private lineLocatorPipe: LineLocatorPipe
  ) {}

  ngOnInit(): void {
    this.loadContentData();
   
  }

  loadContentData(): void {
    this.contentDataService
      .getContentData()
      .pipe(
        catchError(error => {
          this.errorMessage = 'There was an error loading the data!';
          return of([]);
        })
      )
      .subscribe(data => {
        this.contentData = data;
        if (data.length > 0) {
          console.log(this.contentData)
          this.columns = Object.keys(data[0]);
        }
      });
  }

  addRow(): void {
    const newRow = {
      ID: '',
      Ordering: '',
      Type: '',
      Content: '',
      'Image URL': '',
      'Image Text': '',
      'What`s New': ''
    };
    this.contentData.push(newRow);
  }

  updateContentData(row: any): void {
    // const contentData = {
    //   rowIndex: this.currentRowIndex !== null ? this.currentRowIndex + 1 : null,
    //   colIndex: this.currentColumnIndex !== null ? this.currentColumnIndex + 1 : null, 
    //   content_ID: row['content_ID'] , 
    //   ordering: row['ordering'],
    //   content: row['content'],
    //   content_Type: row['content_Type'],
    //   imageURL: row['imageURL'],
    //   image_Text: row['image_Text']};
    const contentData = {
      rowIndex: this.currentRowIndex !== null ? this.currentRowIndex + 1 : null,
      colIndex: this.currentColumnIndex !== null ? this.currentColumnIndex + 1 : null, 
      content_ID: row['content_ID'] || null|| '',  
      ordering: row['ordering'] || null || '',                     
      content: row['content'] || null || '' ,       
      content_Type: row['content_Type'] || null || '',  
      imageURL: row['imageURL'] || null || '',      
      image_Text: row['image_Text'] || null || ''   
    };
    this.contentDataService
      .updateAllContentData(contentData)
      .subscribe();
  }

  toggleViewMode(): void {
    this.isViewMode = !this.isViewMode;
    this.selectedRow = null;
  }

  viewRow(row: any) {
    this.selectedRow = row;
  }

  switchToTopicView(): void {
    this.isViewMode = false;
    this.isTopicView = true;
  }

  getColumnStyle(column: string): { [key: string]: string } {
    return { width: this.columnWidths[column] || 'auto' };
  }

  openManualView(): void {
    this.isViewMode = true;
  }

  onCellClick(row: any, column: string, rowIndex: number): void {
    this.clickedCell = {
      rowIndex: rowIndex,
      column: column
    };
    this.sendClickedCellDataToBackend(rowIndex, column);
  }

  sendClickedCellDataToBackend(rowIndex: number, column: string): void {
    this.contentDataService.sendCellClickData({ rowIndex, column })
      .subscribe(response => {
        // console.log('Cell click data sent successfully!', response);
      });
  }

  isEditing(row: any, column: string): boolean {
    return this.editingCell?.row === row && this.editingCell?.column === column;
  }

  isTextareaMode(row: any, column: string): boolean {
    const cellKey = this.getCellKey(row, column);
    return this.textareaCells.has(cellKey);
  }

  startEdit(row: any, column: string): void {
    this.editingCell = { row, column };
    const cellKey = this.getCellKey(row, column);
    if (!this.textareaCells.has(cellKey)) {
      this.textareaCells.add(cellKey);
    }

    const element = document.getElementById(`${row.id}-${column}`);
    if (element) {
      this.renderer.setProperty(element, 'focus', true);
      this.renderer.addClass(element, 'editing');
    }
  }

  stopEdit(row: any, column: string): void {
    this.editingCell = null;
  }

  private getCellKey(row: any, column: string): string {
    return `${row.id}-${column}`;
  }

  setActiveCell(rowIndex: number, columnIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColumnIndex = columnIndex;
  }

  isActiveCell(rowIndex: number, columnIndex: number): boolean {
    return this.currentRowIndex === rowIndex && this.currentColumnIndex === columnIndex;
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }
  

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.contentData.length === 0) return;

    if (this.editingCell) {
      const { row, column } = this.editingCell;
      const currentRowIndex = this.contentData.indexOf(row);
      const currentColumnIndex = this.columns.indexOf(column);

      switch (event.key) {
        case 'ArrowRight':
          if (currentColumnIndex < this.columns.length - 1) {
            this.startEdit(row, this.columns[currentColumnIndex + 1]);
          }
          event.preventDefault();
          break;
        case 'ArrowLeft':
          if (currentColumnIndex > 0) {
            this.startEdit(row, this.columns[currentColumnIndex - 1]);
          }
          event.preventDefault();
          break;
        case 'ArrowDown':
          const nextRow = this.contentData[currentRowIndex + 1];
          if (nextRow) {
            this.startEdit(nextRow, column);
          }
          event.preventDefault();
          break;
        case 'ArrowUp':
          const prevRow = this.contentData[currentRowIndex - 1];
          if (prevRow) {
            this.startEdit(prevRow, column);
          }
          event.preventDefault();
          break;

        case 'Tab':
          if (event.shiftKey) {
            if (currentColumnIndex > 0) {
              this.startEdit(row, this.columns[currentColumnIndex - 1]);
            } else if (currentRowIndex > 0) {
              const prevRow = this.contentData[currentRowIndex - 1];
              this.startEdit(prevRow, this.columns[this.columns.length - 1]);
            }
          } else {
            if (currentColumnIndex < this.columns.length - 1) {
              this.startEdit(row, this.columns[currentColumnIndex + 1]);
            } else if (currentRowIndex < this.contentData.length - 1) {
              const nextRow = this.contentData[currentRowIndex + 1];
              this.startEdit(nextRow, this.columns[0]);
            }
          }
          event.preventDefault();
          break;

        case 'Enter':
          this.stopEdit(row, column);
          if (currentColumnIndex < this.columns.length - 1) {
            this.startEdit(row, this.columns[currentColumnIndex + 1]);
          } else if (currentRowIndex < this.contentData.length - 1) {
            const nextRowEnter = this.contentData[currentRowIndex + 1];
            this.startEdit(nextRowEnter, this.columns[0]);
          }
          event.preventDefault();
          break;
        case 'Escape':
          this.stopEdit(row, column);
          event.preventDefault();
          break;
      }
    } else {
      if (event.key === 'Enter') {
        const firstRow = this.contentData[0];
        this.startEdit(firstRow, this.columns[0]);
        event.preventDefault();
      }
    }
  }
  
  currentView: string = 'contentEditor';
  shouldShowContentEditor : boolean = false;
  navigatetoselectedtopictoMDK = false;
  // shouldnotShowContentEditor = false;
  navigatetoselectedtopicChange : any 
  
  navigateToUserManual(row: { content_ID: string; ordering: string; content_Type: string; content: string; imageURL: string; imageText: string }): void {
   
    // this.navigatetoselectedtopicChange = row ;
  
    // // this.navigatetoselectedtopicChange.emit(selectedContent); 
    // this.shouldShowContentEditor =  true
    this.router.navigate(['/MDK'], { state: { rowData: row } });
  }
  
  private getContentFromRow(row: { content_ID: string; ordering: string; content_Type: string; content: string; imageURL: string; imageText: string }): string {
    this.shouldShowContentEditor  = true
    // this.shouldnotShowContentEditor = false;
    this.router.navigate(['/MDK'], { queryParams: { id: 
      row.content_ID } });
    return row.content_ID;
  }
  
  highlightContent(term: string, content: string) {
    if (term && content.includes(term)) {
      this.navigatetoselectedtopicChange.emit(term);
    }
  }
}
